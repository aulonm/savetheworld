import Vue from 'vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';
import App from './App.vue';
import router from './router';
import store from './store';

import './styles/main.scss';

Vue.config.productionTip = false;

library.add(faUserCircle);

Vue.component('font-awesome-icon', FontAwesomeIcon);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
