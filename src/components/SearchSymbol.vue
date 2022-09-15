<script setup lang="ts">
import { Ref, ref } from "vue";
let currentSymbols: { text: string }[] = [];

const show = ref(false);
const fieldValue = ref("");
const cascaderValue = ref("");

const showSymbols: Ref<{ text: string }[]> = ref([]);

const onFinish = (e: { selectedOptions: { text: string }[] }) => {
  show.value = false;
  console.log(e.selectedOptions);

  fieldValue.value = e.selectedOptions
    .map((option: { text: string }) => option.text)
    .join("/");

  window.electronAPI.symbolSelected(fieldValue.value);
};
const value = ref("");

const onUpdateModelValue = (value: string) => {
  let arrs = currentSymbols.filter((exchange) => {
    return exchange.text.toLowerCase().includes(value.toLowerCase());
  });
  updateSymbols(arrs);
};
const onClearSearch = () => {
  updateSymbols(currentSymbols);
};
const updateSymbols = (val: { text: string }[]) => {
  showSymbols.value = val;
};
window.electronAPI.onSymbolsLoaded((e: any, symbols: string[]) => {
  console.log(symbols);
  currentSymbols = symbols.map((symbolName) => {
    return { text: symbolName };
  });
  let showSymbolsTemp: { text: string }[] = [];
  symbols.forEach((symbolName) => {
    showSymbolsTemp.push({
      text: symbolName,
    });
  });
  updateSymbols(showSymbolsTemp);
});
</script>

<template>
  <van-field
    v-model="fieldValue"
    is-link
    readonly
    label="Symbol"
    placeholder="Please select symbol"
    @click="show = true"
  />
  <van-popup v-model:show="show" round position="bottom">
    <van-search
      v-model="value"
      placeholder="Please select symbol"
      @update:model-value="onUpdateModelValue"
      @clear="onClearSearch"
      @cancel="onClearSearch"
    >
    </van-search>
    <van-cascader
      active-color="#1989fa"
      v-model="cascaderValue"
      title="Please select symbol"
      placeholder="Symbol"
      :options="showSymbols"
      @close="show = false"
      @finish="onFinish"
    />
  </van-popup>
</template>
