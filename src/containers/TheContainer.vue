<template>
  <div class="c-app">
    <TheSidebar/>
    <CWrapper>
      <TheHeader/>
      <div class="c-body">
        <main class="c-main">
          <CContainer fluid>
            <transition name="fade" mode="out-in">
              <router-view :key="$route.path"></router-view>
            </transition>
          </CContainer>
        </main>
         <b-modal id="modal-center" centered title="Network not supported" v-model="show"  ok-only>
            <p class="my-4">
            This network currently isn't supported. Please change to a supported network and refresh the page.<br><br>
            Testnets supported are: Rinkeby, Binance Smart Chain<br>
            Mainnets supported are: There are currently no mainnets supported
            </p>
        </b-modal>
      </div>
      <TheFooter/>
    </CWrapper>
  </div>
</template>

<script>
import { store } from "../api/Store";
import TheSidebar from './TheSidebar'
import TheHeader from './TheHeader'
import TheFooter from './TheFooter'

export default {
  name: 'TheContainer',
  data() {
      return {
        show: false,
      }
  },
  components: {
    TheSidebar,
    TheHeader,
    TheFooter
  },
   mounted() {
     console.log("networkNotSupported:",store.networkNotSupported)
     if (store.networkNotSupported){
       this.show = true;
     }
   }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
