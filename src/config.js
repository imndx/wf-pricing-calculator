/**
 * 野火 IM 报价计算器 —— 数据配置
 *
 * 计费模型：
 *   1. 按组件付费，报价 = 所选组件价格之和；没被选中的组件不计费。
 *   2. 免费组件（社区版 IM-Server、多人版音视频、Android/iOS SDK）会随需求自动包含，价格为 0。
 *   3. 部分功能只能运行在专业版 IM-Server 上，选中后自动引入专业版，界面上会写明是被谁带进来的。
 *
 * 改价格只需要改 components 里的 price；改需求只需要改 requirementGroups。
 */

/**
 * 全部付费组件的打包封顶价：合计超过该金额时，按该金额成交。
 * 设为 null 可关闭封顶。
 */
export const BUNDLE_PRICE = 450000

/** 试用申请地址 */
export const TRIAL_URL = 'https://docs.wildfirechat.cn/trial/'

/** 可售组件。price 为 0 即免费组件。 */
export const components = [
    {id: 'im_community', name: '社区版 IM-Server', desc: '开源社区版即时通讯服务', price: 0},
    {id: 'im_pro', name: '专业版 IM-Server', desc: '商用 IM 服务，性能更强、功能更全', price: 29000},

    {id: 'voip_multi', name: '多人版音视频', desc: '支持多人音视频通话，不支持会议', price: 0},
    {id: 'voip_pro', name: '高级版音视频', desc: '支持音视频通话和音视频会议', price: 59000},

    {id: 'sdk_android', name: 'Android SDK', desc: '支持原生、Flutter 和 uniapp', price: 0},
    {id: 'sdk_ios', name: 'iOS SDK', desc: '支持原生、Flutter 和 uniapp', price: 0},
    {id: 'sdk_harmony', name: '鸿蒙 NEXT SDK', desc: '支持鸿蒙 NEXT', price: 29000},
    {id: 'sdk_web', name: 'Web SDK', desc: '浏览器里运行的 Web 应用使用', price: 10000},
    {id: 'sdk_wx', name: '小程序 SDK', desc: '微信小程序使用', price: 10000},
    {id: 'sdk_pc', name: 'Windows + macOS PC SDK', desc: 'Windows 和 macOS 桌面客户端使用', price: 29000},
    {id: 'sdk_linux_x86', name: 'Linux PC SDK（x86 / amd64）', desc: 'x86 / amd64 架构的 Linux 桌面客户端', price: 29000},
    {id: 'sdk_linux_arm64', name: 'Linux PC SDK（arm64）', desc: 'arm64 架构的 Linux 桌面客户端', price: 29000},
    {id: 'sdk_linux_sw', name: 'Linux PC SDK（申威）', desc: '申威架构的 Linux 桌面客户端', price: 29000},
    {id: 'sdk_linux_loongarch', name: 'Linux PC SDK（龙芯）', desc: 'loongarch / mips64el 架构的 Linux 桌面客户端', price: 29000},

    {id: 'sdk_moment', name: '朋友圈 SDK', desc: '支持朋友圈功能', price: 10000},
    {id: 'sdk_ptt', name: '对讲 SDK', desc: '支持实时对讲功能', price: 29000},
    {id: 'speech_to_text', name: '语音转文字服务', desc: '把语音消息转成文字', price: 10000},
]

/**
 * 需求分组。
 *   type 'multi'  —— 多选，可以都不选
 *   type 'choice' —— 单选，必选其一（用来表达服务的免费版 / 付费版）
 * 每一项：
 *   components 该项引入的组件
 *   options    该项下面还要再细分选择（Linux 按 CPU 架构分别授权）
 *   needsPro   该项只能跑在专业版 IM-Server 上
 */
export const requirementGroups = [
    {
        id: 'platform',
        name: '你要做哪些端',
        hint: 'Android 和 iOS 的 SDK 免费，其余端按端授权。',
        type: 'multi',
        items: [
            {id: 'android', name: 'Android 客户端', desc: '原生、Flutter 或 uniapp 开发', components: ['sdk_android']},
            {id: 'ios', name: 'iOS 客户端', desc: '原生、Flutter 或 uniapp 开发', components: ['sdk_ios']},
            {id: 'harmony', name: '鸿蒙客户端', desc: '鸿蒙原生、Flutter 或 uniapp 开发', components: ['sdk_harmony']},
            {id: 'web', name: 'Web 端', desc: '电脑浏览器、手机浏览器和微信内置浏览器', components: ['sdk_web'], needsPro: true},
            {id: 'wx', name: '微信小程序', desc: '在微信小程序里聊天', components: ['sdk_wx'], needsPro: true},
            {
                id: 'pc',
                name: 'Windows / macOS 客户端',
                desc: '安装到电脑上的客户端，不是浏览器',
                components: ['sdk_pc'],
            },
            {
                id: 'linux',
                name: 'Linux 客户端',
                desc: 'Ubuntu、统信 UOS、麒麟等系统，按 CPU 架构分别授权',
                components: [],
                options: [
                    {id: 'linux_x86', name: 'x86 / amd64', components: ['sdk_linux_x86']},
                    {id: 'linux_arm64', name: 'arm64', components: ['sdk_linux_arm64']},
                    {id: 'linux_sw', name: '申威', components: ['sdk_linux_sw']},
                    {id: 'linux_loongarch', name: '龙芯 loongarch / mips64el', components: ['sdk_linux_loongarch']},
                ],
            },
        ],
    },
    {
        id: 'feature',
        name: '你还要哪些功能',
        hint: '单聊、群聊、聊天室这些基础能力已经在 IM 服务里，不用另外买。下面这些是额外的组件。',
        type: 'multi',
        items: [
            {id: 'moment', name: '朋友圈', desc: '类似微信朋友圈', components: ['sdk_moment'], needsPro: true},
            {
                id: 'speech_to_text',
                name: '语音转文字',
                desc: '类似微信，把语音消息转成文字',
                components: ['speech_to_text'],
                needsPro: true,
            },
            {
                id: 'ptt',
                name: '实时对讲',
                desc: '按下抢麦说话、其他端实时收听的对讲机功能。发语音消息不需要选它，绝大多数客户用不到。',
                components: ['sdk_ptt'],
                needsPro: true,
            },
        ],
    },
    {
        id: 'voip',
        name: '音视频要用哪一版',
        hint: '两版二选一。',
        type: 'choice',
        default: 'voip_multi',
        short: '音视频',
        items: [
            {id: 'voip_multi', name: '多人版', desc: '多人音视频通话，不支持会议', components: ['voip_multi']},
            {
                id: 'voip_pro',
                name: '高级版',
                desc: '在通话之外支持音视频会议，能力更强',
                components: ['voip_pro'],
                needsPro: true,
                ref: 'https://docs.wildfirechat.cn/blogs/%E9%87%8E%E7%81%AB%E9%9F%B3%E8%A7%86%E9%A2%91%E7%AE%80%E4%BB%8B.html',
            },
        ],
    },
    {
        id: 'server',
        name: 'IM 服务要用哪一版',
        hint: '上面带「需专业版」标记的选项会自动把这里升到专业版。',
        type: 'choice',
        default: 'im_community',
        short: 'IM 服务',
        items: [
            {id: 'im_community', name: '社区版', desc: '开源免费，够用就不用升级', components: ['im_community']},
            {
                id: 'im_pro',
                name: '专业版',
                desc: '性能更好、功能更强，支持更大规模的部署',
                components: ['im_pro'],
                needsPro: true,
                ref: 'https://docs.wildfirechat.cn/commercial_server',
            },
        ],
    },
]
