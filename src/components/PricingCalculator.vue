<script setup>
import {computed, ref} from "vue";
import {product_requirement_list, commercial_products} from "../config.js";

defineProps({
    msg: {
        type: String,
        required: true
    }
})

const productRequirementList = ref({})

const initProductRequirementList = () => {
    productRequirementList.value = product_requirement_list.map(u => Object.assign({}, u))
    curReqIndex.value = -1
}


const curReqIndex = ref(-1)

const computedProductRequirementList = computed(() => {
    let shouldIncludeLinux = productRequirementList.value.filter(pr => pr.id === 'linux')[0].checked;
    let filteredList = productRequirementList.value;
    if (!shouldIncludeLinux) {
        filteredList = productRequirementList.value.filter(pr => !pr.id.startsWith('linux-'));
    }

    let reqListDependOnCommercialIMServer = productRequirementList.value.filter(pr => {
        return pr.checked &&
            (pr.id.startsWith('web')
                || pr.id.startsWith('wx')
                || pr.id.startsWith('moment')
                || pr.id.startsWith('ptt')
                || pr.id.startsWith('conference_voip'))
    })
    if (reqListDependOnCommercialIMServer.length > 0) {
        filteredList = filteredList.filter(pr => pr.id !== 'commercial_imserver');
    }

    return filteredList;
})

const computedCurReq = computed(() => {
    if (curReqIndex.value < computedProductRequirementList.value.length) {
        return computedProductRequirementList.value[curReqIndex.value]
    } else {
        return {}
    }
})

const checkedProductRequirementList = computed(() => {
    let list = productRequirementList.value.filter(req => req.checked === true)
    if (list.findIndex(p => ['commercial_imserver', 'web', 'wx', 'moment', 'ptt', 'conference_voip'].indexOf(p.id)) === -1) {
        // 社区版 im-server
        list.push({
                id: 'community_imserver',
                name: '社区版 IM 服务',
                dependencies: [],
            }
        )
    } else {
        list.push({
                id: 'commercial_imserver',
                name: '专业版 IM 服务',
                dependencies: [],
            }
        )
    }
    if (list.findIndex(p => p.id === 'conference_voip') === -1) {
        // 多人版音视频
        list.push({
                id: 'multi_voip',
                name: '多人版音视频',
                dependencies: [],
            }
        )
    }
    return list;
})


const computedCommercialProductList = computed(() => {
    let map = new Map()
    for (const pr of checkedProductRequirementList.value) {
        if (pr.id === 'linux') {
            for (const arch of pr.archList) {
                if (arch.checked) {
                    for (const id of arch.dependencies) {
                        let cp = commercial_products.filter(p => p.id === id)[0]
                        map.set(id, cp)
                    }
                }
            }
        }
        if (pr.dependencies.length > 0) {
            for (const id of pr.dependencies) {
                let cp = commercial_products.filter(p => p.id === id)[0]
                map.set(id, cp)
            }
        }
    }
    let list = [...map.values()];
    // 高级版音视频 SDK
    if (!map.get(9)) {
        list.splice(0, 0, {
            name: '多人版音视频 SDK',
            desc: '多人版音视频功能',
            price: 0.00,
        })
    }
    // 专业版im-server
    if (!map.get(1)) {
        list.splice(0, 0, {
            name: '社区版 IM-Server',
            desc: '社区版 IM 服务',
            price: 0.00,
        })
    }
    return list

})

initProductRequirementList()

</script>

<template>
    <div class="greetings">
        <div class="intro" v-if="curReqIndex === -1">
            <p class="title">野火IM 价格计算器</p>
            <p class="desc">为了能够准确计算价格，请根据实际需求，准确回答相关问题</p>
            <button @click="curReqIndex ++">开始</button>
        </div>

        <div v-else-if="curReqIndex < computedProductRequirementList.length" class="req_item">
            <p class="title">{{ computedCurReq.title }}</p>
            <p class="desc">{{ computedCurReq.desc }}
                <a v-if="computedCurReq.ref" target="_blank" :href="computedCurReq.ref">链接</a>
            </p>
            <form>
                <label>
                    <input :checked="computedCurReq.checked" type="radio" @change="computedCurReq.checked = true"/>
                    是
                </label>

                <div v-if="computedCurReq.id === 'linux' && computedCurReq.checked" class="arch-list">
                    <p>请选择需要支持的 CPU 架构</p>
                    <div v-for="(arch) in computedCurReq.archList" :key="arch.name">
                        <label>
                            <input :checked="arch.checked" type="checkbox" @change="arch.checked = $event.target.checked"/>
                            {{ arch.name }}
                        </label>
                    </div>
                </div>
                <label>
                    <input :checked="!computedCurReq.checked" type="radio" @change="computedCurReq.checked = false"/>
                    否
                </label>
            </form>

            <div class="action-container">
                <button @click="initProductRequirementList">
                    重置
                </button>
                <button @click="curReqIndex ++" :disabled="computedCurReq.id === 'linux' && computedCurReq.checked && computedCurReq.archList.filter(a => a.checked).length === 0">
                    下一项
                </button>
            </div>
        </div>
        <div v-else-if="curReqIndex === computedProductRequirementList.length" style="height: 100%">
            <div v-if="checkedProductRequirementList.length > 0" class="checked_req_item">
                <div style="flex: 1">
                    <p class="title" style="padding-bottom: 10px">你的产品需求如下，请确认</p>
                    <div v-for="(req, index) in checkedProductRequirementList" :key="index">
                        <p v-if="req.id !== 'linux'">{{ req.name }}</p>
                        <div v-else-if="req.id === 'linux'">
                            <p v-for="(arch) in req.archList.filter(a => a.checked)" :key="arch.name">{{ `Linux 客户端(${arch.name})` }}</p>
                        </div>
                    </div>
                </div>
                <div class="action-container">
                    <button @click="initProductRequirementList">
                        重置
                    </button>
                    <button @click="curReqIndex ++">
                        确定
                    </button>
                </div>
            </div>
            <div v-else class="params-invalid-container">
                <p class="title">需求不合法</p>
                <button @click="initProductRequirementList">
                    重置
                </button>
            </div>

        </div>
        <div v-else class="report">
            <div style="flex: 1">
                <p class="title">你的产品需求对应的费用详情如下，请参考</p>
                <div v-for="(cp, index) in computedCommercialProductList" :key="index">
                    <div style="display: flex">
                        <p style="flex: 1">{{ cp.name + ': ' }}</p>
                        <p>{{ cp.price + '.00' }}</p>
                    </div>
                </div>
                <p></p>
                <div style="padding-top: 10px; display: flex; font-size: 1.2rem">
                    <p style="flex: 1">{{ '合计：' }}</p>
                    <p>{{ computedCommercialProductList.map(p => p.price).reduce((pre, cur, index) => pre + cur, 0) + '.00' }}</p>
                </div>
                <p style="padding-top: 50px; text-align: center; font-size: 1.0rem; color: #3f64e4">
                    野火IM 提供行业内唯一长达半年的试用服务，快点击 <a style="color: red" target="_blank" href="https://docs.wildfirechat.cn/trial/">链接</a> 申请试用吧
                </p>
            </div>

            <div class="action-container">
                <button @click="initProductRequirementList">
                    确定
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>

.greetings {
    width: 100%;
    height: 100%;
}

button:active {
    border: 1px solid #4168e0 !important;
}

.intro {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.intro .title {
    font-size: 2.2rem;
}

.intro .desc {
    padding-top: 10px;
}

.intro button {
    margin-top: 200px;
    width: 120px;
    height: 50px;
    border: none;
    border-radius: 4px;
}

.req_item {
    height: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

.req_item .title {
    font-size: 1.5rem;
}

.req_item .desc {
    margin-top: 10px;
    font-size: 1.0rem;
}

.req_item form {
    flex: 1;
}

.req_item form label {
    padding: 10px;
    display: flex;
    align-items: center;
    width: 100%;
    height: 40px;
}

.req_item form label:active {
    border: 1px solid #4168e0;
    border-radius: 4px;
}

.req_item form label input {
    margin-right: 10px;
}

.req_item .arch-list {
    margin-left: 30px;
}

.checked_req_item {
    height: 100%;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

.checked_req_item .title {
    font-size: 1.5rem;
}

.checked_req_item .desc {
    margin-top: 10px;
    font-size: 1.0rem;
}

.report {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.report .title {
    font-size: 1.5rem;
    padding-bottom: 10px;
}

.params-invalid-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.params-invalid-container button {
    justify-self: flex-end;
    margin-top: 200px;
}

.action-container {
    justify-self: flex-end;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
}

button {
    width: 120px;
    height: 50px;
    border: none;
    border-radius: 4px;
}


@media (min-width: 1024px) {
    .greetings {
        width: 100%;
        height: 100%;
    }
}
</style>
