export const product_requirement_list = [
    {
        id: 'android',
        category: 'platform',
        name: 'Android 客户端',
        title: '是否需要 Android 客户端？',
        desc: '可使用 Android 原生、Flutter 或 uniapp 开发。',
        checked: false,
        dependencies: [12],
    },
    {
        id: 'ios',
        category: 'platform',
        name: 'iOS 客户端',
        title: '是否需要 iOS 客户端？',
        desc: '可使用 iOS 原生、Flutter 或 uniapp 开发。',
        checked: false,
        dependencies: [13],
    },
    {
        id: 'harmony',
        category: 'platform',
        name: '鸿蒙客户端',
        title: '是否需要 鸿蒙 客户端？',
        desc: '可使用鸿蒙原生、Flutter 或 uniapp 开发。',
        checked: false,
        dependencies: [11],
    },
    {
        id: 'web',
        category: 'platform',
        name: 'Web端',
        title: '是否需要 Web 端？',
        desc: '支持电脑浏览器、手机浏览器和微信浏览器',
        checked: false,
        dependencies: [1, 3],
    },
    {
        id: 'wx',
        name: '小程序端',
        category: 'platform',
        title: '是否需要 微信小程序 端？',
        desc: '支持微信小程序',
        checked: false,
        dependencies: [1, 4],
    },
    {
        id: 'pc',
        name: 'Windows 客户端',
        category: 'platform',
        title: '是否需要支持 PC 端？',
        desc: '包含Windows 和 macOS平台， 软件安装，非浏览器',
        checked: false,
        dependencies: [2],
    },
    {
        id: 'linux',
        category: 'platform',
        title: '是否需要支持 Linux PC 端？',
        desc: '支持 Ubuntu、 UOS、麒麟，以及其他国产系统，软件安装，非浏览器',
        checked: false,
        archList: [
            {
                name: 'x86/amd64',
                checked: false,
                dependencies: [5],
            },
            {
                name: 'arm64',
                checked: false,
                dependencies: [6],
            },
            {
                name: '申威',
                checked: false,
                dependencies: [7],
            },
            {
                name: 'loongarch/misp64el(龙芯)',
                checked: false,
                dependencies: [8],
            },
        ],
        dependencies: [],
    },
    {
        id: 'moment',
        name: '朋友圈',
        category: 'feature',
        title: '是否需要 朋友圈 功能？',
        desc: '类似微信朋友圈',
        checked: false,
        dependencies: [1],
    },
    {
        id: 'ptt',
        name: '对讲（非发语音消息）',
        category: 'feature',
        title: '是否需要支持对讲功能？',
        desc: '类似对讲机功能，按下抢麦说话，其他端实时播放，不是发送语音消息',
        checked: false,
        dependencies: [1, 10],
    },
    {
        id: 'conference_voip',
        name: '高级版音视频',
        category: 'feature',
        title: '是否需要使用高级版音视频功能？',
        desc: '音视频功能有两个版本：免费版和需要付费的高级版。高级版支持会议功能，功能也更强大，具体区别请参考',
        ref: 'https://docs.wildfirechat.cn/blogs/%E9%87%8E%E7%81%AB%E9%9F%B3%E8%A7%86%E9%A2%91%E7%AE%80%E4%BB%8B.html',
        checked: false,
        dependencies: [1, 9],
    },
    {
        id: 'commercial_imserver',
        name: '专业版 IM 服务',
        title: '是否需要使用专业版 IM 服务？',
        desc: 'IM 服务有两个版本：免费社区版和需要付费的专业版。专业版 IM 性能更好，功能更强大，具体区别请参考',
        ref: 'https://docs.wildfirechat.cn/commercial_server',
        category: 'feature',
        checked: false,
        dependencies: [1],
    },
]

export const commercial_products = [
    {
        id: 1,
        name: '专业版 IM-Server',
        desc: '专业版 IM 服务',
        price: 29000.00,
    },
    {
        id: 2,
        name: 'Windows + macOS PC SDK',
        desc: 'Windows 和 macOS 端的 PC SDK',
        price: 29000.00,
    },
    {
        id: 3,
        name: 'Web SDK',
        desc: '运行在浏览器的 Web 应用使用的 SDK',
        price: 10000.00,
    },
    {
        id: 4,
        name: '小程序 SDK',
        desc: '运行在浏览器的 Web 应用使用的 SDK',
        price: 10000.00,
    },
    {
        id: 5,
        name: 'Linux PC SDK(x86/amd64)',
        desc: 'CPU 架构为 x86/amd64 的 Linux 端使用的 PC SDK',
        price: 29000.00,
    },
    {
        id: 6,
        name: 'Linux PC SDK(arm64)',
        desc: 'CPU 架构为 arm64 的 Linux 端使用的 PC SDK',
        price: 29000.00,
    },
    {
        id: 7,
        name: 'Linux PC SDK(sw)',
        desc: 'CPU 架构为申威的 Linux 端使用的 PC SDK',
        price: 29000.00,
    },
    {
        id: 8,
        name: 'Linux PC SDK(loongarch/misp64el)',
        desc: 'CPU 架构为龙芯的 Linux 端使用的 PC SDK',
        price: 29000.00,
    },
    {
        id: 9,
        name: '高级版音视频 SDK',
        desc: '实现音视频通话，及音视频会议功能',
        price: 59000.00,
    },
    {
        id: 10,
        name: '对讲 SDK',
        desc: '实现对讲功能',
        price: 10000.00,
    },
    {
        id: 11,
        name: '鸿蒙next SDK',
        desc: '支持鸿蒙 next',
        price: 10000.00,
    },
    {
        id: 12,
        name: 'Android 客户端',
        desc: 'Android 客户端，支持原生、Flutter 和 uniapp',
        price: 0.00,
    },
    {
        id: 13,
        name: 'iOS 客户端',
        desc: 'Android 客户端，支持原生、Flutter 和 uniapp',
        price: 0.00,
    },
    {
        id: 14,
        name: '社区版 IM-Server',
        desc: '社区版 IM 服务',
        price: 0.00,
    },
    {
        id: 15,
        name: '多人版音视频 SDK',
        desc: ' 支持多人音视频通话，不支持会议',
        price: 0.00,
    },
]
