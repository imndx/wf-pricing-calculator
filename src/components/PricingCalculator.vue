<script setup>
import {computed, reactive, ref} from 'vue'
import {BUNDLE_PRICE, TRIAL_URL, components, requirementGroups} from '../config.js'

const componentById = new Map(components.map(c => [c.id, c]))

/** 多选项的勾选状态：需求项 id / Linux 架构 id -> true */
const picked = reactive({})
/** 单选组的选择：分组 id -> 需求项 id */
const chosen = reactive({})

const copied = ref(false)

const reset = () => {
    Object.keys(picked).forEach(k => delete picked[k])
    requirementGroups.forEach(g => {
        if (g.type === 'choice') {
            chosen[g.id] = g.default
        }
    })
    copied.value = false
}
reset()

/** 选中后会把 IM 服务顶到专业版的需求项（专业版自己不算） */
const proDrivers = computed(() => {
    const drivers = []
    for (const group of requirementGroups) {
        if (group.id === 'server') continue
        for (const item of group.items) {
            if (item.needsPro && isPicked(group, item)) {
                drivers.push(item.name)
            }
        }
    }
    return drivers
})

const serverLocked = computed(() => proDrivers.value.length > 0)

function isPicked(group, item) {
    if (group.type === 'choice') {
        return valueOf(group) === item.id
    }
    return picked[item.id] === true
}

/** 单选组当前的值。IM 服务被功能顶上去时，以专业版为准。 */
function valueOf(group) {
    if (group.id === 'server' && serverLocked.value) {
        return 'im_pro'
    }
    return chosen[group.id]
}

function toggle(group, item, event) {
    if (group.type === 'choice') {
        if (group.id === 'server' && serverLocked.value) return
        chosen[group.id] = item.id
    } else {
        picked[item.id] = event.target.checked
    }
    copied.value = false
}

function toggleOption(option, event) {
    picked[option.id] = event.target.checked
    copied.value = false
}

/** 需求项自身的价格（不含它依赖的专业版） */
function itemPrice(item) {
    return item.components.reduce((sum, id) => sum + componentById.get(id).price, 0)
}

const hasSelection = computed(() =>
    Object.values(picked).some(Boolean) ||
    requirementGroups.some(g => g.type === 'choice' && chosen[g.id] !== g.default))

/** 当前选中的所有需求，展开成「名字 -> 引入的组件」 */
const activeSelections = computed(() => {
    const list = []
    for (const group of requirementGroups) {
        for (const item of group.items) {
            if (!isPicked(group, item)) continue
            const self = group.id === 'server'
            // 版本类的选项单独列出来时要带上分组名，「专业版」才不会变成没头没尾的一个词
            const label = group.short ? `${group.short}${item.name}` : item.name
            if (item.components.length) {
                list.push({name: label, components: item.components, self})
            }
            for (const option of item.options ?? []) {
                if (picked[option.id]) {
                    list.push({name: `${item.name}（${option.name}）`, components: option.components, self})
                }
            }
        }
    }
    return list
})

/** 报价单行：组件 + 它是被哪些需求带进来的 */
const quoteLines = computed(() => {
    const lines = new Map()
    // key 'reasons' 是自己勾的，'via' 是被别的需求依赖出来的
    const add = (componentId, name, key = 'reasons') => {
        if (!lines.has(componentId)) {
            lines.set(componentId, {component: componentById.get(componentId), reasons: [], via: []})
        }
        const line = lines.get(componentId)
        if (name && !line[key].includes(name)) {
            line[key].push(name)
        }
    }

    for (const selection of activeSelections.value) {
        selection.components.forEach(id => add(id, selection.self ? null : selection.name))
    }
    // 专业版是被功能依赖来的，记下是谁依赖的
    if (serverLocked.value) {
        proDrivers.value.forEach(name => add('im_pro', name, 'via'))
    }
    // 按 config 里的组件顺序出单：先服务，后各端 SDK
    const order = components.map(c => c.id)
    return [...lines.values()].sort((a, b) => order.indexOf(a.component.id) - order.indexOf(b.component.id))
})

const freeLines = computed(() => quoteLines.value.filter(l => l.component.price === 0))
const paidLines = computed(() => quoteLines.value.filter(l => l.component.price > 0))

const subtotal = computed(() => paidLines.value.reduce((sum, l) => sum + l.component.price, 0))
const capped = computed(() => BUNDLE_PRICE !== null && subtotal.value > BUNDLE_PRICE)
const total = computed(() => capped.value ? BUNDLE_PRICE : subtotal.value)

const yuan = new Intl.NumberFormat('zh-CN')
const money = n => `¥${yuan.format(n)}`

/** 报价单纯文本，方便贴进邮件或需求文档 */
const quoteText = computed(() => {
    const rows = [
        '野火 IM 报价',
        '',
        `需求：${activeSelections.value.map(s => s.name).join('、') || '未选择'}`,
        '',
    ]
    if (freeLines.value.length) {
        rows.push('免费包含')
        freeLines.value.forEach(l => rows.push(`  ${l.component.name}  ¥0`))
    }
    if (paidLines.value.length) {
        rows.push('付费组件')
        paidLines.value.forEach(l => rows.push(`  ${l.component.name}  ${money(l.component.price)}`))
    }
    rows.push('')
    if (capped.value) {
        rows.push(`小计  ${money(subtotal.value)}`)
        rows.push(`打包封顶价  ${money(total.value)}`)
    } else {
        rows.push(`合计  ${money(total.value)}`)
    }
    return rows.join('\n')
})

async function copyQuote() {
    try {
        await navigator.clipboard.writeText(quoteText.value)
    } catch {
        // 非 https 或旧浏览器下 clipboard 不可用，退回到 execCommand
        try {
            const area = document.createElement('textarea')
            area.value = quoteText.value
            document.body.appendChild(area)
            area.select()
            document.execCommand('copy')
            area.remove()
        } catch {
            return
        }
    }
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
    <div class="calculator">
        <header class="masthead">
            <h1>野火 IM 报价计算器</h1>
            <p>勾选你要做的客户端端和功能，报价单跟着一起变。</p>
        </header>

        <div class="layout">
            <div class="config">
                <div class="rules">
                    <h2>费用是怎么算出来的</h2>
                    <dl>
                        <div>
                            <dt>按组件买</dt>
                            <dd>报价就是你选中的组件价格之和，没选的一分不收。</dd>
                        </div>
                        <div>
                            <dt>不少是免费的</dt>
                            <dd>社区版 IM 服务、多人版音视频、Android 和 iOS SDK  等都是 0 元。</dd>
                        </div>
                        <div>
                            <dt>有些会带出依赖</dt>
                            <dd>Web、小程序、朋友圈这类功能只跑在专业版 IM 上，选中它们就会自动加上专业版，报价单里会写清楚是谁依赖的。</dd>
                        </div>
                    </dl>
                </div>

                <section v-for="group in requirementGroups" :key="group.id" class="group">
                    <h2>{{ group.name }}</h2>
                    <p class="hint">{{ group.hint }}</p>

                    <ul class="options">
                        <li v-for="item in group.items" :key="item.id">
                            <label class="option"
                                   :class="{ 'is-on': isPicked(group, item), 'is-locked': group.id === 'server' && serverLocked }">
                                <input class="tick"
                                       :type="group.type === 'choice' ? 'radio' : 'checkbox'"
                                       :name="group.id"
                                       :checked="isPicked(group, item)"
                                       :disabled="group.id === 'server' && serverLocked"
                                       @change="toggle(group, item, $event)"/>
                                <span class="option-body">
                                    <span class="option-name">
                                        {{ item.name }}
                                        <a v-if="item.ref" :href="item.ref" target="_blank" rel="noopener"
                                           @click.stop>版本对比</a>
                                    </span>
                                    <span class="option-desc">{{ item.desc }}</span>
                                </span>
                                <span class="option-price">
                                    <span v-if="item.options" class="tag">按架构计价</span>
                                    <template v-else>
                                        <span v-if="itemPrice(item) === 0" class="free">免费</span>
                                        <span v-else class="num">{{ money(itemPrice(item)) }}</span>
                                        <span v-if="item.needsPro && group.id !== 'server'" class="tag">需专业版</span>
                                        <span v-if="item.id === 'im_pro' && serverLocked" class="tag tag--lock">已自动选中</span>
                                    </template>
                                </span>
                            </label>

                            <p v-if="group.id === 'server' && item.id === 'im_pro' && serverLocked" class="locked-note">
                                已按 {{ proDrivers.join('、') }} 的要求自动选中，取消这些功能就能回到社区版。
                            </p>

                            <ul v-if="item.options && isPicked(group, item)" class="suboptions">
                                <li v-for="option in item.options" :key="option.id">
                                    <label class="option option--sub" :class="{ 'is-on': picked[option.id] }">
                                        <input class="tick" type="checkbox" :checked="picked[option.id] === true"
                                               @change="toggleOption(option, $event)"/>
                                        <span class="option-body">
                                            <span class="option-name">{{ option.name }}</span>
                                        </span>
                                        <span class="option-price">
                                            <span class="num">{{ money(itemPrice(option)) }}</span>
                                        </span>
                                    </label>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </section>
            </div>

            <aside class="quote" id="quote">
                <div class="quote-sheet">
                    <div class="quote-head">
                        <h2>报价单</h2>
                        <button class="link" type="button" :disabled="!hasSelection" @click="reset">重新选择</button>
                    </div>

                    <p v-if="!hasSelection" class="quote-empty">
                        还没选任何付费组件。下面是你免费就能用的部分，勾选左边的端和功能，这里会实时更新。
                    </p>

                    <section v-if="freeLines.length" class="ledger">
                        <h3>免费包含</h3>
                        <div v-for="line in freeLines" :key="line.component.id" class="row">
                            <span class="row-name">{{ line.component.name }}</span>
                            <span class="row-price free">¥0</span>
                        </div>
                    </section>

                    <section v-if="paidLines.length" class="ledger">
                        <h3>付费组件</h3>
                        <TransitionGroup name="line">
                            <div v-for="line in paidLines" :key="line.component.id" class="row">
                                <span class="row-name">
                                    {{ line.component.name }}
                                    <span v-if="line.via.length" class="row-why">由 {{ line.via.join('、') }} 依赖</span>
                                    <span v-else-if="line.reasons.length > 1" class="row-why">{{ line.reasons.join('、') }} 共用</span>
                                </span>
                                <span class="row-price num">{{ money(line.component.price) }}</span>
                            </div>
                        </TransitionGroup>
                    </section>

                    <div class="total">
                        <template v-if="capped">
                            <div class="row total-strike">
                                <span>组件小计</span>
                                <span class="num">{{ money(subtotal) }}</span>
                            </div>
                            <div class="row total-final">
                                <span>打包封顶价</span>
                                <span class="num">{{ money(total) }}</span>
                            </div>
                        </template>
                        <div v-else class="row total-final">
                            <span>合计</span>
                            <span class="num">{{ money(total) }}</span>
                        </div>
                    </div>

                    <div class="quote-actions">
                        <a class="cta" :href="TRIAL_URL" target="_blank" rel="noopener">申请半年免费试用</a>
                        <button class="ghost" type="button" @click="copyQuote">
                            {{ copied ? '已复制' : '复制清单' }}
                        </button>
                    </div>
                    <p class="quote-foot">价格仅供参考，实际以商务报价为准。买之前可以先申请半年免费试用。</p>
                </div>
            </aside>
        </div>

        <div class="bar" :class="{ 'is-live': paidLines.length || freeLines.length }">
            <span class="bar-label">合计</span>
            <span class="bar-price num">{{ money(total) }}</span>
            <a class="bar-link" href="#quote">看明细</a>
        </div>
    </div>
</template>

<style scoped>
.calculator {
    max-width: 1080px;
    margin: 0 auto;
    padding: 32px 20px 96px;
}

/* ---------- 页眉 ---------- */

.masthead {
    padding-bottom: 20px;
    border-bottom: 2px solid var(--ink);
}

.masthead h1 {
    font-size: 1.9rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--ink);
    line-height: 1.25;
}

.masthead p {
    margin-top: 6px;
    color: var(--ink-mid);
    max-width: 42em;
}

.layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
    margin-top: 28px;
    align-items: start;
}

@media (min-width: 900px) {
    .layout {
        grid-template-columns: minmax(0, 1fr) 352px;
        gap: 36px;
    }
}

/* ---------- 计费规则 ---------- */

.rules {
    padding: 18px 20px;
    background: var(--brand-wash);
    border-radius: 8px;
}

.rules h2 {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--brand-ink);
}

.rules dl {
    margin-top: 10px;
    display: grid;
    gap: 8px;
}

.rules dt {
    font-weight: 600;
    color: var(--ink);
}

.rules dd {
    color: var(--ink-mid);
    margin: 2px 0 0;
}

@media (min-width: 620px) {
    .rules dl > div {
        display: grid;
        grid-template-columns: 7.5em minmax(0, 1fr);
        gap: 12px;
        align-items: baseline;
    }

    .rules dd {
        margin-top: 0;
    }
}

/* ---------- 需求分组 ---------- */

.group {
    margin-top: 30px;
}

.group h2 {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--ink);
}

.group .hint {
    margin-top: 4px;
    color: var(--ink-soft);
    max-width: 46em;
}

.options {
    list-style: none;
    margin: 12px 0 0;
    padding: 0;
    border-top: 1px solid var(--rule);
}

.options > li {
    border-bottom: 1px solid var(--rule);
}

.option {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 13px 12px 13px 10px;
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: background-color 0.12s ease, border-color 0.12s ease;
}

.option:hover {
    background: #f3f6fc;
}

.option.is-on {
    background: var(--brand-wash);
    border-left-color: var(--brand);
}

.option.is-locked {
    cursor: default;
}

.option.is-locked:hover {
    background: none;
}

.option.is-locked.is-on:hover {
    background: var(--brand-wash);
}

.tick {
    margin: 3px 0 0;
    width: 17px;
    height: 17px;
    flex: none;
    accent-color: var(--brand);
}

.option-body {
    flex: 1;
    min-width: 0;
}

.option-name {
    display: block;
    font-weight: 600;
    color: var(--ink);
}

.option.is-on .option-name {
    color: var(--brand-ink);
}

.option-name a {
    margin-left: 8px;
    font-weight: 400;
    font-size: 0.85rem;
    color: var(--brand);
}

.option-desc {
    display: block;
    margin-top: 2px;
    font-size: 0.88rem;
    color: var(--ink-soft);
    line-height: 1.5;
}

.option-price {
    flex: none;
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
    padding-top: 1px;
}

.option-price .num {
    font-weight: 600;
    color: var(--ink);
}

.free {
    color: var(--free);
    font-weight: 600;
}

.tag {
    font-size: 0.75rem;
    color: var(--ink-soft);
    background: var(--ground);
    border-radius: 3px;
    padding: 1px 6px;
    white-space: nowrap;
}

.tag--lock {
    background: var(--brand);
    color: #fff;
}

.option.is-on .tag {
    background: #dbe4ff;
    color: var(--brand-ink);
}

.option.is-on .tag--lock {
    background: var(--brand);
    color: #fff;
}

.locked-note {
    padding: 0 12px 12px 55px;
    margin: -4px 0 0;
    font-size: 0.85rem;
    color: var(--brand-ink);
    background: var(--brand-wash);
    border-left: 3px solid var(--brand);
}

.suboptions {
    list-style: none;
    margin: 0;
    padding: 0 0 6px 34px;
}

.suboptions > li + li {
    border-top: 1px solid var(--rule);
}

.option--sub {
    padding: 9px 12px;
    border-left-width: 2px;
}

.option--sub .option-name {
    font-weight: 400;
}

/* ---------- 报价单 ---------- */

@media (min-width: 900px) {
    .quote {
        position: sticky;
        top: 24px;
    }
}

.quote-sheet {
    background: var(--paper);
    border: 1px solid var(--rule-strong);
    border-top: 3px solid var(--ink);
    border-radius: 2px;
    padding: 18px 20px 20px;
}

.quote-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding-bottom: 12px;
}

.quote-head h2 {
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: var(--ink);
}

.quote-empty {
    padding: 14px 0 6px;
    color: var(--ink-soft);
    border-top: 1px solid var(--rule);
}

.ledger {
    position: relative;
    padding: 12px 0;
    border-top: 1px solid var(--rule);
}

.ledger h3 {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--ink-soft);
    margin-bottom: 6px;
}

.row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding: 4px 0;
}

.row-name {
    color: var(--ink);
    min-width: 0;
}

.row-why {
    display: block;
    font-size: 0.8rem;
    color: var(--brand-ink);
    line-height: 1.45;
}

.row-price {
    flex: none;
    color: var(--ink);
}

.total {
    border-top: 3px double var(--rule-strong);
    padding-top: 10px;
}

.total-final {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--ink);
}

.total-strike {
    color: var(--ink-soft);
}

.total-strike .num {
    text-decoration: line-through;
}

.quote-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
}

.cta {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 42px;
    padding: 0 14px;
    background: var(--brand);
    color: #fff;
    font-weight: 600;
    border-radius: 5px;
    text-decoration: none;
}

.cta:hover {
    background: var(--brand-ink);
}

.ghost {
    height: 42px;
    padding: 0 14px;
    background: var(--paper);
    color: var(--ink-mid);
    border: 1px solid var(--rule-strong);
    border-radius: 5px;
    font: inherit;
    cursor: pointer;
}

.ghost:hover {
    border-color: var(--brand);
    color: var(--brand);
}

.link {
    background: none;
    border: none;
    padding: 0;
    font: inherit;
    font-size: 0.85rem;
    color: var(--brand);
    cursor: pointer;
}

.link:disabled {
    color: var(--ink-soft);
    cursor: default;
}

.quote-foot {
    margin-top: 12px;
    font-size: 0.8rem;
    line-height: 1.55;
    color: var(--ink-soft);
}

/* ---------- 窄屏底部合计条 ---------- */

.bar {
    display: none;
}

@media (max-width: 899px) {
    .bar.is-live {
        display: flex;
        align-items: center;
        gap: 10px;
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 12px 20px;
        background: var(--paper);
        border-top: 1px solid var(--rule-strong);
        box-shadow: 0 -2px 12px rgba(22, 35, 61, 0.08);
    }

    .bar-label {
        color: var(--ink-mid);
    }

    .bar-price {
        flex: 1;
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--ink);
    }

    .bar-link {
        color: var(--brand);
        font-weight: 600;
    }
}

/* ---------- 新增条目时的提示动画 ---------- */

.line-enter-active {
    transition: background-color 0.9s ease, opacity 0.2s ease;
}

.line-enter-from {
    opacity: 0;
    background-color: #fdf0c9;
}

.line-leave-active {
    transition: opacity 0.15s ease;
    position: absolute;
}

.line-leave-to {
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .line-enter-active,
    .line-leave-active,
    .option {
        transition: none;
    }
}
</style>
