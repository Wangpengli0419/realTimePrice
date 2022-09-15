<template>
  <van-field
    v-model="fieldValue"
    is-link
    readonly
    label="Exchange"
    placeholder="Please select exchange"
    @click="show = true"
  />
  <van-popup v-model:show="show" round position="bottom">
    <van-search
      v-model="value"
      placeholder="Please select exchange"
      @update:model-value="onUpdateModelValue"
      @clear="onClearSearch"
      @cancel="onClearSearch"
    >
    </van-search>
    <van-cascader
      active-color="#1989fa"
      v-model="cascaderValue"
      title="Please select exchange"
      placeholder="Exchange"
      :options="showExchanges"
      @close="show = false"
      @finish="onFinish"
    />
  </van-popup>
</template>
<script setup lang="ts">
import { Ref, ref } from "vue";
let currentExchanges: { text: string }[] = [];

const show = ref(false);
const fieldValue = ref("");
const cascaderValue = ref("");
const value = ref("");
const showExchanges: Ref<{ text: string }[]> = ref([]);
const onFinish = (e: { selectedOptions: { text: string }[] }) => {
  show.value = false;
  console.log(e.selectedOptions);

  fieldValue.value = e.selectedOptions
    .map((option: { text: string }) => option.text)
    .join("/");

  window.electronAPI.exchangeSelected(fieldValue.value);
};
const onUpdateModelValue = (value: string) => {
  let arrs = currentExchanges.filter((exchange) => {
    return exchange.text.toLowerCase().includes(value.toLowerCase());
  });
  updateExchanges(arrs);
};
const onClearSearch = () => {
  console.log(123);

  updateExchanges(currentExchanges);
};
const updateExchanges = (val: { text: string }[]) => {
  showExchanges.value = val;
};
window.electronAPI.onExchangesLoaded((e: any, exchanges: string[]) => {
  console.log(exchanges);
  currentExchanges = exchanges.map((exchange) => {
    return { text: exchange };
  });
  let showExchangesTemp: { text: string }[] = [];
  exchanges.forEach((exchange) => {
    showExchangesTemp.push({
      text: exchange,
    });
  });
  updateExchanges(showExchangesTemp);
});
</script>
