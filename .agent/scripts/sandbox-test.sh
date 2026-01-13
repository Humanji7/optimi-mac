#!/bin/bash
# ============================================================================
# 🧪 Sandbox Test — MVP валидация AI-инфраструктуры проекта
#
# Использование:
#   bash sandbox-test.sh <project-name>           # только lint
#   bash sandbox-test.sh <project-name> --smoke   # lint + smoke-тест
#
# Что делает:
#   1. Копирует проект в sandbox (безопасно)
#   2. Запускает lint-проверки структуры
#   3. [--smoke] Запускает агента с тестовой задачей
#   4. Генерирует отчёт
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config
SANDBOX_DIR="/tmp/sandbox-test"
PROJECTS_DIR="${HOME}/projects"
MAX_CLAUDE_MD_SIZE=15000  # bytes — больше плохо влезает в контекст
SMOKE_TIMEOUT=60          # секунд на smoke-тест
SMOKE_MIN_LENGTH=100      # минимум символов в ответе

# ============================================================================
# Helpers
# ============================================================================

log_pass() { echo -e "${GREEN}✅ $1${NC}"; }
log_fail() { echo -e "${RED}❌ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_header() { echo -e "\n${BLUE}═══ $1 ═══${NC}\n"; }

# ============================================================================
# Args
# ============================================================================

RUN_SMOKE=false
PROJECT_NAME=""

for arg in "$@"; do
    case $arg in
        --smoke)
            RUN_SMOKE=true
            ;;
        *)
            if [[ -z "$PROJECT_NAME" ]]; then
                PROJECT_NAME="$arg"
            fi
            ;;
    esac
done

if [[ -z "$PROJECT_NAME" ]]; then
    echo "Использование: sandbox-test.sh <project-name> [--smoke]"
    echo "Пример: sandbox-test.sh my-app --smoke"
    exit 1
fi

PROJECT_PATH="$PROJECTS_DIR/$PROJECT_NAME"

if [[ ! -d "$PROJECT_PATH" ]]; then
    log_fail "Проект не найден: $PROJECT_PATH"
    exit 1
fi

# ============================================================================
# 1. Копируем в sandbox
# ============================================================================

log_header "1. КОПИРОВАНИЕ В SANDBOX"

# Очищаем предыдущий sandbox
rm -rf "$SANDBOX_DIR"
mkdir -p "$SANDBOX_DIR"

# Копируем проект (без node_modules и тяжёлых папок)
log_info "Копирую $PROJECT_NAME в $SANDBOX_DIR/"

rsync -a --exclude='node_modules' --exclude='.git' --exclude='dist' \
      --exclude='build' --exclude='venv' --exclude='__pycache__' \
      "$PROJECT_PATH/" "$SANDBOX_DIR/$PROJECT_NAME/"

log_pass "Скопировано в $SANDBOX_DIR/$PROJECT_NAME/"

# ============================================================================
# 2. LINT — проверка структуры
# ============================================================================

log_header "2. LINT — СТРУКТУРА"

SANDBOX_PROJECT="$SANDBOX_DIR/$PROJECT_NAME"
LINT_PASS=0
LINT_FAIL=0
LINT_WARN=0

# Check: .agent/ exists
if [[ -d "$SANDBOX_PROJECT/.agent" ]]; then
    log_pass ".agent/ существует"
    ((LINT_PASS++))
else
    log_fail ".agent/ НЕ найден — инфраструктура отсутствует"
    ((LINT_FAIL++))
fi

# Check: CLAUDE.md exists
if [[ -f "$SANDBOX_PROJECT/CLAUDE.md" ]]; then
    log_pass "CLAUDE.md существует"
    ((LINT_PASS++))

    # Check size
    CLAUDE_SIZE=$(wc -c < "$SANDBOX_PROJECT/CLAUDE.md")
    if [[ $CLAUDE_SIZE -gt $MAX_CLAUDE_MD_SIZE ]]; then
        log_warn "CLAUDE.md слишком большой (${CLAUDE_SIZE} bytes) — может не влезть в контекст"
        ((LINT_WARN++))
    else
        log_pass "CLAUDE.md размер ок (${CLAUDE_SIZE} bytes)"
        ((LINT_PASS++))
    fi

    # Check not empty
    if [[ $CLAUDE_SIZE -lt 100 ]]; then
        log_warn "CLAUDE.md почти пустой — мало инструкций для агента"
        ((LINT_WARN++))
    fi
else
    log_fail "CLAUDE.md НЕ найден"
    ((LINT_FAIL++))
fi

# Check: HOOK.md (active work)
if [[ -f "$SANDBOX_PROJECT/.agent/HOOK.md" ]]; then
    log_warn "HOOK.md активен — есть незавершённая работа"
    ((LINT_WARN++))
else
    log_pass "HOOK.md не активен — чисто"
    ((LINT_PASS++))
fi

# Check: workflows exist
if [[ -d "$SANDBOX_PROJECT/.agent/workflows" ]]; then
    WORKFLOW_COUNT=$(ls -1 "$SANDBOX_PROJECT/.agent/workflows"/*.md 2>/dev/null | wc -l)
    if [[ $WORKFLOW_COUNT -gt 0 ]]; then
        log_pass "Workflows: $WORKFLOW_COUNT шт."
        ((LINT_PASS++))
    else
        log_warn "Папка workflows пустая"
        ((LINT_WARN++))
    fi
else
    log_info "Папка workflows отсутствует (опционально)"
fi

# Check: README exists
if [[ -f "$SANDBOX_PROJECT/README.md" ]]; then
    log_pass "README.md существует"
    ((LINT_PASS++))
else
    log_warn "README.md отсутствует — агенту сложнее понять проект"
    ((LINT_WARN++))
fi

# ============================================================================
# 3. Отчёт
# ============================================================================

log_header "3. ОТЧЁТ"

echo "Проект: $PROJECT_NAME"
echo "Sandbox: $SANDBOX_PROJECT"
echo ""
echo -e "Результат: ${GREEN}$LINT_PASS pass${NC} | ${RED}$LINT_FAIL fail${NC} | ${YELLOW}$LINT_WARN warn${NC}"

if [[ $LINT_FAIL -gt 0 ]]; then
    echo ""
    log_fail "Lint НЕ пройден — есть критичные проблемы"
    LINT_STATUS="FAIL"
elif [[ $LINT_WARN -gt 0 ]]; then
    echo ""
    log_warn "Lint пройден с предупреждениями"
    LINT_STATUS="WARN"
else
    echo ""
    log_pass "Lint полностью пройден"
    LINT_STATUS="PASS"
fi

# ============================================================================
# 4. Smoke-тест
# ============================================================================

SMOKE_STATUS="SKIP"
SMOKE_RESPONSE=""
SMOKE_PASS=0
SMOKE_FAIL=0

if [[ "$RUN_SMOKE" == "true" ]]; then
    log_header "4. SMOKE-ТЕСТ (автоматический)"

    # Проверяем наличие claude CLI
    if ! command -v claude &> /dev/null; then
        log_fail "Claude CLI не найден. Установи: npm install -g @anthropic-ai/claude-code"
        SMOKE_STATUS="FAIL"
    else
        log_info "Запускаю агента с тестовой задачей..."
        log_info "Задача: \"Опиши структуру этого проекта кратко\""
        log_info "Таймаут: ${SMOKE_TIMEOUT}s"
        echo ""

        # Собираем список ключевых файлов для проверки (корень + первый уровень подпапок)
        KEY_FILES=$(ls -1 "$SANDBOX_PROJECT" 2>/dev/null | grep -v '^\.' | head -5)
        # Добавляем файлы из ключевых подпапок (src, lib, app, hub и т.д.)
        for subdir in src lib app hub core components pages api; do
            if [[ -d "$SANDBOX_PROJECT/$subdir" ]]; then
                KEY_FILES="$KEY_FILES $(ls -1 "$SANDBOX_PROJECT/$subdir" 2>/dev/null | head -3)"
            fi
        done

        # Запускаем claude с таймаутом
        SMOKE_RESPONSE_FILE="$SANDBOX_DIR/smoke-response.txt"

        # macOS не имеет timeout, проверяем gtimeout или запускаем без таймаута
        TIMEOUT_CMD=""
        if command -v gtimeout &> /dev/null; then
            TIMEOUT_CMD="gtimeout $SMOKE_TIMEOUT"
        elif command -v timeout &> /dev/null; then
            TIMEOUT_CMD="timeout $SMOKE_TIMEOUT"
        else
            log_warn "timeout/gtimeout не найден — запуск без таймаута"
        fi

        cd "$SANDBOX_PROJECT"
        if $TIMEOUT_CMD claude -p "Опиши структуру этого проекта кратко. Ответ на русском." --output-format text > "$SMOKE_RESPONSE_FILE" 2>&1; then
            SMOKE_RESPONSE=$(cat "$SMOKE_RESPONSE_FILE")

            # Проверка 1: Ответ не пустой
            if [[ -n "$SMOKE_RESPONSE" ]]; then
                log_pass "Ответ получен"
                ((SMOKE_PASS++))
            else
                log_fail "Ответ пустой"
                ((SMOKE_FAIL++))
            fi

            # Проверка 2: Достаточная длина
            RESPONSE_LENGTH=${#SMOKE_RESPONSE}
            if [[ $RESPONSE_LENGTH -gt $SMOKE_MIN_LENGTH ]]; then
                log_pass "Длина ответа: $RESPONSE_LENGTH символов"
                ((SMOKE_PASS++))
            else
                log_warn "Ответ короткий: $RESPONSE_LENGTH символов"
                ((SMOKE_FAIL++))
            fi

            # Проверка 3: Упомянуты файлы/папки проекта
            FILES_MENTIONED=0
            FILES_CHECKED=0
            for file in $KEY_FILES; do
                # Убираем расширение и слэши для гибкого поиска
                file_base=$(basename "$file" | sed 's/\.[^.]*$//')
                [[ -z "$file_base" ]] && continue
                [[ ${#file_base} -lt 3 ]] && continue  # Пропускаем слишком короткие
                ((FILES_CHECKED++))

                # Ищем частичное совпадение (без учёта регистра)
                if echo "$SMOKE_RESPONSE" | grep -qi "$file_base"; then
                    ((FILES_MENTIONED++))
                fi
            done

            if [[ $FILES_MENTIONED -gt 0 ]]; then
                log_pass "Упомянуто элементов проекта: $FILES_MENTIONED из $FILES_CHECKED"
                ((SMOKE_PASS++))
            else
                log_warn "Элементы проекта не упомянуты в ответе (проверено: $FILES_CHECKED)"
                ((SMOKE_FAIL++))
            fi

            # Определяем статус
            if [[ $SMOKE_FAIL -eq 0 ]]; then
                SMOKE_STATUS="PASS"
                log_pass "Smoke-тест пройден"
            else
                SMOKE_STATUS="WARN"
                log_warn "Smoke-тест с предупреждениями"
            fi

        else
            log_fail "Таймаут или ошибка агента"
            SMOKE_STATUS="FAIL"
            ((SMOKE_FAIL++))
            if [[ -f "$SMOKE_RESPONSE_FILE" ]]; then
                SMOKE_RESPONSE=$(cat "$SMOKE_RESPONSE_FILE")
            fi
        fi
        cd - > /dev/null

        # Показываем ответ агента
        echo ""
        echo -e "${BLUE}─── Ответ агента ───${NC}"
        echo "$SMOKE_RESPONSE" | head -30
        if [[ $(echo "$SMOKE_RESPONSE" | wc -l) -gt 30 ]]; then
            echo -e "${YELLOW}... (обрезано, полный ответ в $SMOKE_RESPONSE_FILE)${NC}"
        fi
        echo -e "${BLUE}────────────────────${NC}"
    fi
else
    log_header "4. SMOKE-ТЕСТ (ручной)"

    echo "Для автоматического smoke-теста добавь флаг --smoke"
    echo ""
    echo "Или проверь вручную:"
    echo ""
    echo -e "${BLUE}─────────────────────────────────────────${NC}"
    echo -e "${YELLOW}cd $SANDBOX_PROJECT${NC}"
    echo -e "${YELLOW}claude${NC}"
    echo ""
    echo "Задача: \"Опиши структуру этого проекта\""
    echo -e "${BLUE}─────────────────────────────────────────${NC}"
    echo ""
    echo "Оцени:"
    echo "  • Агент понял контекст проекта?"
    echo "  • Агент следовал правилам из CLAUDE.md?"
    echo "  • Результат адекватный?"
fi

# ============================================================================
# 5. Сохраняем отчёт
# ============================================================================

REPORT_FILE="$SANDBOX_DIR/report.md"

# Определяем общий статус
if [[ "$LINT_STATUS" == "FAIL" ]] || [[ "$SMOKE_STATUS" == "FAIL" ]]; then
    OVERALL_STATUS="FAIL"
elif [[ "$LINT_STATUS" == "WARN" ]] || [[ "$SMOKE_STATUS" == "WARN" ]]; then
    OVERALL_STATUS="WARN"
else
    OVERALL_STATUS="PASS"
fi

cat > "$REPORT_FILE" << EOF
# Sandbox Test Report

**Проект:** $PROJECT_NAME
**Дата:** $(date '+%Y-%m-%d %H:%M')
**Статус:** $OVERALL_STATUS

## Lint Results

- Status: $LINT_STATUS
- Pass: $LINT_PASS
- Fail: $LINT_FAIL
- Warn: $LINT_WARN

## Smoke Test

- Status: $SMOKE_STATUS
- Pass: $SMOKE_PASS
- Fail: $SMOKE_FAIL

$(if [[ "$RUN_SMOKE" == "true" ]] && [[ -n "$SMOKE_RESPONSE" ]]; then
echo "### Ответ агента"
echo ""
echo "\`\`\`"
echo "$SMOKE_RESPONSE"
echo "\`\`\`"
fi)

## Sandbox Path

\`$SANDBOX_PROJECT\`

## Чеклист (ручная проверка)

- [ ] Агент понял контекст проекта
- [ ] Агент следовал правилам CLAUDE.md
- [ ] Результат адекватный

## Notes

_(добавь заметки)_
EOF

echo ""
log_info "Отчёт сохранён: $REPORT_FILE"
