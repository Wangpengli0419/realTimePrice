import { createApp } from "vue";
import App from './App.vue';
import 'vant/es/toast/style';
import '@vant/touch-emulator';
// import './samples/node-api'
// import { Button } from 'vant';
const app = createApp(App);

app.mount('#app').$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*')
});

// app.use(Button)
