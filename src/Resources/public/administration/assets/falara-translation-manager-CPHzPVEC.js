const{Application:f}=Shopware;class v{constructor(t,e){this.httpClient=t,this.loginService=e,this.basePath="_action/falara"}getHeaders(){return{Authorization:`Bearer ${this.loginService.getToken()}`,"Content-Type":"application/json"}}connect(t,e){return this.httpClient.post(`${this.basePath}/connect`,{salesChannelId:t,apiKey:e},{headers:this.getHeaders()})}disconnect(t){return this.httpClient.post(`${this.basePath}/disconnect`,{salesChannelId:t},{headers:this.getHeaders()})}getConnection(t){return this.httpClient.get(`${this.basePath}/connection/${t}`,{headers:this.getHeaders()})}getUsage(t){return this.httpClient.get(`${this.basePath}/settings/usage/${t}`,{headers:this.getHeaders()})}getContentItems(t,e,r={}){return this.httpClient.get(`${this.basePath}/content/${t}/${e}`,{params:r,headers:this.getHeaders()})}getContentTypes(){return this.httpClient.get(`${this.basePath}/content-types`,{headers:this.getHeaders()})}translate(t){return this.httpClient.post(`${this.basePath}/translate`,t,{headers:this.getHeaders()})}getJobs(t,e={}){return this.httpClient.get(`${this.basePath}/jobs/${t}`,{params:e,headers:this.getHeaders()})}getJob(t){return this.httpClient.get(`${this.basePath}/jobs/detail/${t}`,{headers:this.getHeaders()})}retryWriteBack(t){return this.httpClient.post(`${this.basePath}/jobs/${t}/retry`,{},{headers:this.getHeaders()})}archiveJob(t){return this.httpClient.patch(`${this.basePath}/jobs/${t}/archive`,{},{headers:this.getHeaders()})}runAudit(t){return this.httpClient.get(`${this.basePath}/audit/${t}`,{headers:this.getHeaders()})}getDefaults(t){return this.httpClient.get(`${this.basePath}/settings/defaults/${t}`,{headers:this.getHeaders()})}saveDefaults(t,e){return this.httpClient.post(`${this.basePath}/settings/defaults/${t}`,e,{headers:this.getHeaders()})}getGlossaries(t){return this.httpClient.get(`${this.basePath}/settings/glossaries/${t}`,{headers:this.getHeaders()})}getCustomFields(t){return this.httpClient.get(`${this.basePath}/settings/custom-fields/${t}`,{headers:this.getHeaders()})}addCustomField(t,e,r){return this.httpClient.post(`${this.basePath}/settings/custom-fields/${t}`,{fieldSetName:e,fieldName:r},{headers:this.getHeaders()})}deleteCustomField(t){return this.httpClient.delete(`${this.basePath}/settings/custom-fields/entry/${t}`,{headers:this.getHeaders()})}}f.addServiceProvider("falaraApiService",a=>{const t=f.getContainer("init");return new v(t.httpClient,a.loginService)});const y="modulepreload",S=function(a){return window.__sw__.assetPath+"/bundles/falaratranslationmanager/administration/"+a},u={},m=function(t,e,r){let s=Promise.resolve();if(e&&e.length>0){let i=function(l){return Promise.all(l.map(c=>Promise.resolve(c).then(h=>({status:"fulfilled",value:h}),h=>({status:"rejected",reason:h}))))};document.getElementsByTagName("link");const n=document.querySelector("meta[property=csp-nonce]"),g=(n==null?void 0:n.nonce)||(n==null?void 0:n.getAttribute("nonce"));s=i(e.map(l=>{if(l=S(l),l in u)return;u[l]=!0;const c=l.endsWith(".css"),h=c?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${h}`))return;const d=document.createElement("link");if(d.rel=c?"stylesheet":y,c||(d.as="script"),d.crossOrigin="",d.href=l,g&&d.setAttribute("nonce",g),document.head.appendChild(d),c)return new Promise((p,b)=>{d.addEventListener("load",p),d.addEventListener("error",()=>b(new Error(`Unable to preload CSS for ${l}`)))})}))}function o(i){const n=new Event("vite:preloadError",{cancelable:!0});if(n.payload=i,window.dispatchEvent(n),!n.defaultPrevented)throw i}return s.then(i=>{for(const n of i||[])n.status==="rejected"&&o(n.reason);return t().catch(o)})},{Component:w}=Shopware;w.register("falara-dashboard",{template:`
        <div class="falara-dashboard">
            <falara-nav-tabs />

            <mt-loader v-if="isLoading" />

            <div v-else-if="!isConnected" :style="cardStyle">
                <h2 :style="{ fontSize: '20px', fontWeight: '600', color: '#1a1a2e', marginBottom: '8px' }">
                    {{ $t('falara-translation-manager.dashboard.notConnected') }}
                </h2>
                <p :style="{ color: '#6b7280', marginBottom: '20px' }">
                    {{ $t('falara-translation-manager.dashboard.notConnectedMessage') }}
                </p>
                <mt-button variant="primary" @click="goToSettings">
                    {{ $t('falara-translation-manager.dashboard.connectNow') }}
                </mt-button>
            </div>

            <div v-else>

                <!-- Quota Card -->
                <div :style="cardStyle">
                    <div :style="{ marginBottom: '16px' }">
                        <span :style="{ fontSize: '11px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }">
                            {{ $t('falara-translation-manager.dashboard.quota') }}
                        </span>
                        <span v-if="usage && usage.plan" :style="{ marginLeft: '8px', fontSize: '11px', background: '#e0e7ff', color: '#3730a3', borderRadius: '4px', padding: '2px 8px', fontWeight: '600' }">
                            {{ usage.plan }}
                        </span>
                    </div>
                    <falara-quota-widget v-if="usage" :usage="usage" />
                </div>

                <!-- Stats Grid -->
                <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }">
                    <div :style="statCardStyle">
                        <span :style="statValueStyle">{{ stats.total }}</span>
                        <span :style="statLabelStyle">{{ $t('falara-translation-manager.dashboard.stats.totalJobs') }}</span>
                    </div>
                    <div :style="statCardStyle">
                        <span :style="{ ...statValueStyle, color: '#16a34a' }">{{ stats.completed }}</span>
                        <span :style="statLabelStyle">{{ $t('falara-translation-manager.dashboard.stats.completedJobs') }}</span>
                    </div>
                    <div :style="statCardStyle">
                        <span :style="{ ...statValueStyle, color: '#dc2626' }">{{ stats.failed }}</span>
                        <span :style="statLabelStyle">{{ $t('falara-translation-manager.dashboard.stats.failedJobs') }}</span>
                    </div>
                    <div :style="statCardStyle">
                        <span :style="{ ...statValueStyle, color: '#d97706' }">{{ stats.pending }}</span>
                        <span :style="statLabelStyle">{{ $t('falara-translation-manager.dashboard.stats.pendingJobs') }}</span>
                    </div>
                </div>

                <!-- Recent Jobs -->
                <div :style="cardStyle">
                    <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }">
                        <span :style="{ fontSize: '15px', fontWeight: '600', color: '#1a1a2e' }">
                            {{ $t('falara-translation-manager.dashboard.recentJobs') }}
                        </span>
                        <mt-button variant="ghost" size="small" @click="goToJobs">
                            {{ $t('falara-translation-manager.dashboard.viewAllJobs') }}
                        </mt-button>
                    </div>

                    <table v-if="recentJobs.length > 0" :style="tableStyle">
                        <thead>
                            <tr>
                                <th :style="thStyle">{{ $t('falara-translation-manager.jobs.type') }}</th>
                                <th :style="thStyle">{{ $t('falara-translation-manager.jobs.status') }}</th>
                                <th :style="thStyle">{{ $t('falara-translation-manager.jobs.targetLanguage') }}</th>
                                <th :style="thStyle">{{ $t('falara-translation-manager.jobs.createdAt') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(job, idx) in recentJobs"
                                :key="job.id"
                                :style="idx % 2 === 0 ? tdRowEvenStyle : tdRowOddStyle"
                                @click="goToJob(job.id)"
                                @mouseenter="$event.currentTarget.style.background = '#f0f4ff'; $event.currentTarget.style.cursor = 'pointer'"
                                @mouseleave="$event.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f9fafb'; $event.currentTarget.style.cursor = 'default'"
                            >
                                <td :style="tdStyle">{{ job.contentType }}</td>
                                <td :style="tdStyle"><falara-status-badge :status="job.status" /></td>
                                <td :style="tdStyle">{{ job.targetLanguage }}</td>
                                <td :style="tdStyle">{{ formatDate(job.createdAt) }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p v-else :style="{ color: '#6b7280', fontSize: '14px' }">
                        {{ $t('falara-translation-manager.jobs.noJobs') }}
                    </p>
                </div>

            </div>
        </div>
    `,data(){return{isLoading:!0,isConnected:!1,usage:null,recentJobs:[],stats:{total:0,completed:0,failed:0,pending:0},salesChannelId:null}},computed:{cardStyle(){return{background:"#ffffff",borderRadius:"10px",padding:"24px",boxShadow:"0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)",marginBottom:"24px",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},statCardStyle(){return{background:"#ffffff",borderRadius:"8px",padding:"20px",border:"1px solid #e5e7eb",display:"flex",flexDirection:"column",gap:"6px",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},statValueStyle(){return{fontSize:"32px",fontWeight:"700",color:"#1a1a2e",lineHeight:"1"}},statLabelStyle(){return{fontSize:"13px",color:"#6b7280",fontWeight:"500"}},tableStyle(){return{width:"100%",borderCollapse:"collapse",fontSize:"14px"}},thStyle(){return{textAlign:"left",padding:"10px 14px",fontSize:"11px",fontWeight:"600",color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em",background:"#f3f4f6",borderBottom:"1px solid #e5e7eb"}},tdStyle(){return{padding:"12px 14px",color:"#374151",borderBottom:"1px solid #f3f4f6",verticalAlign:"middle"}},tdRowEvenStyle(){return{background:"#ffffff"}},tdRowOddStyle(){return{background:"#f9fafb"}}},created(){this.loadDashboard()},methods:{async loadDashboard(){var a;this.isLoading=!0;try{const e=await Shopware.Service("repositoryFactory").create("sales_channel").search(new Shopware.Data.Criteria,Shopware.Context.api);if(e.length===0){this.isConnected=!1;return}this.salesChannelId=e.first().id;const r=Shopware.Service("falaraApiService");try{const s=await r.getConnection(this.salesChannelId);this.isConnected=!!(s.data&&s.data.connection&&!s.data.connection.disconnectedAt)}catch{this.isConnected=!1}if(this.isConnected){try{const s=await r.getUsage(this.salesChannelId);this.usage=s.data||{}}catch{this.usage={}}try{const o=((a=(await r.getJobs(this.salesChannelId,{limit:10})).data)==null?void 0:a.items)||[];this.recentJobs=o.slice(0,5),this.stats.total=o.length,this.stats.completed=o.filter(i=>["completed","written_back"].includes(i.status)).length,this.stats.failed=o.filter(i=>["failed","dead","writeback_failed"].includes(i.status)).length,this.stats.pending=o.filter(i=>["pending","queued","processing"].includes(i.status)).length}catch{this.recentJobs=[]}}}finally{this.isLoading=!1}},formatDate(a){return a?new Date(a).toLocaleString():"-"},goToSettings(){this.$router.push({name:"falara.translation.manager.settings"})},goToJobs(){this.$router.push({name:"falara.translation.manager.jobs"})},goToJob(a){this.$router.push({name:"falara.translation.manager.job.detail",params:{id:a}})}}});const{Component:$}=Shopware;$.register("falara-content",{template:`
        <div class="falara-content">
            <falara-nav-tabs />

            <mt-loader v-if="isLoading" />

            <div v-else>

                <!-- Custom Tab Bar -->
                <div :style="tabBarStyle">
                    <button
                        v-for="tab in tabItems"
                        :key="tab.name"
                        :style="activeTab === tab.name ? activeTabBtnStyle : tabBtnStyle"
                        @click="onTabChange(tab.name)"
                        @mouseenter="hoverTab = tab.name"
                        @mouseleave="hoverTab = null"
                    >
                        {{ tab.label }}
                    </button>
                </div>

                <!-- Toolbar -->
                <div :style="{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '16px' }">
                    <div :style="{ flex: 1 }">
                        <mt-text-field
                            :label="$t('falara-translation-manager.content.search')"
                            v-model="searchTerm"
                            @change="onSearch"
                        />
                    </div>
                    <mt-button
                        variant="primary"
                        :disabled="selectedItems.length === 0"
                        @click="openTranslateModal"
                    >
                        {{ $t('falara-translation-manager.content.translateSelected') }}
                        <span v-if="selectedItems.length > 0">&nbsp;({{ selectedItems.length }})</span>
                    </mt-button>
                </div>

                <!-- Table -->
                <div :style="tableWrapStyle">
                    <table v-if="items.length > 0" :style="tableStyle">
                        <thead>
                            <tr>
                                <th :style="thStyle" :style="{ ...thStyle, width: '40px' }">
                                    <mt-checkbox
                                        :checked="allSelected"
                                        @change="toggleAll"
                                    />
                                </th>
                                <th :style="thStyle">{{ $t('falara-translation-manager.content.name') }}</th>
                                <th :style="thStyle">{{ $t('falara-translation-manager.content.type') }}</th>
                                <th :style="thStyle">{{ $t('falara-translation-manager.content.lastTranslated') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(item, idx) in items"
                                :key="item.id"
                                :style="idx % 2 === 0 ? tdRowEvenStyle : tdRowOddStyle"
                            >
                                <td :style="tdStyle">
                                    <mt-checkbox
                                        :checked="selectedItems.includes(item.id)"
                                        @change="toggleItem(item.id)"
                                    />
                                </td>
                                <td :style="tdStyle">{{ item.name }}</td>
                                <td :style="tdStyle">{{ item.type }}</td>
                                <td :style="tdStyle">{{ item.lastTranslated ? formatDate(item.lastTranslated) : '-' }}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p v-else :style="{ padding: '32px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }">
                        {{ $t('falara-translation-manager.general.noData') }}
                    </p>
                </div>

                <!-- Pagination -->
                <div v-if="totalPages > 1" :style="{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '20px' }">
                    <mt-button variant="ghost" :disabled="currentPage <= 1" @click="prevPage">«</mt-button>
                    <span :style="{ fontSize: '14px', color: '#374151', fontWeight: '500' }">{{ currentPage }} / {{ totalPages }}</span>
                    <mt-button variant="ghost" :disabled="currentPage >= totalPages" @click="nextPage">»</mt-button>
                </div>

            </div>

            <!-- Translate Modal -->
            <div v-if="showTranslateModal" :style="modalOverlayStyle">
                <div :style="modalStyle">
                    <mt-card :title="$t('falara-translation-manager.modal.title')">
                        <falara-translate-modal
                            :items="selectedItemObjects"
                            :sales-channel-id="salesChannelId"
                            :defaults="translationDefaults"
                            @translate="onTranslate"
                            @cancel="showTranslateModal = false"
                        />
                    </mt-card>
                </div>
            </div>
        </div>
    `,data(){return{isLoading:!1,activeTab:"product",hoverTab:null,searchTerm:"",items:[],selectedItems:[],currentPage:1,totalPages:1,pageSize:25,totalItems:0,showTranslateModal:!1,salesChannelId:null,translationDefaults:{}}},computed:{tabItems(){return[{name:"product",label:this.$t("falara-translation-manager.content.product")},{name:"category",label:this.$t("falara-translation-manager.content.category")},{name:"cms_page",label:this.$t("falara-translation-manager.content.cms_page")},{name:"snippet",label:this.$t("falara-translation-manager.content.snippet")}]},allSelected(){return this.items.length>0&&this.items.every(a=>this.selectedItems.includes(a.id))},selectedItemObjects(){return this.items.filter(a=>this.selectedItems.includes(a.id))},tabBarStyle(){return{display:"flex",gap:"4px",marginBottom:"20px",background:"#f3f4f6",borderRadius:"8px",padding:"4px",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},tabBtnStyle(){return{background:"none",border:"none",borderRadius:"6px",padding:"8px 18px",cursor:"pointer",fontSize:"14px",fontWeight:"500",color:"#6b7280",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif",transition:"all 0.15s ease"}},activeTabBtnStyle(){return{...this.tabBtnStyle,background:"#ffffff",color:"#1a73e8",fontWeight:"600",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}},tableWrapStyle(){return{background:"#ffffff",borderRadius:"8px",border:"1px solid #e5e7eb",overflow:"hidden"}},tableStyle(){return{width:"100%",borderCollapse:"collapse",fontSize:"14px",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},thStyle(){return{textAlign:"left",padding:"10px 16px",fontSize:"11px",fontWeight:"600",color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em",background:"#f9fafb",borderBottom:"2px solid #e5e7eb"}},tdStyle(){return{padding:"12px 16px",color:"#374151",borderBottom:"1px solid #f3f4f6",verticalAlign:"middle"}},tdRowEvenStyle(){return{background:"#ffffff"}},tdRowOddStyle(){return{background:"#f9fafb"}},modalOverlayStyle(){return{position:"fixed",top:"0",left:"0",width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:"1000"}},modalStyle(){return{width:"600px",maxWidth:"90vw",maxHeight:"90vh",overflow:"auto"}}},created(){this.activeTab=this.$route.params.type||"product",this.initSalesChannel()},methods:{async initSalesChannel(){const t=await Shopware.Service("repositoryFactory").create("sales_channel").search(new Shopware.Data.Criteria,Shopware.Context.api);t.length>0&&(this.salesChannelId=t.first().id,await this.loadDefaults(),await this.loadItems())},async loadDefaults(){if(this.salesChannelId)try{const t=await Shopware.Service("falaraApiService").getDefaults(this.salesChannelId);this.translationDefaults=t.data||{}}catch{this.translationDefaults={}}},async loadItems(){var a,t;if(this.salesChannelId){this.isLoading=!0;try{const e=Shopware.Service("falaraApiService"),r={page:this.currentPage,limit:this.pageSize,search:this.searchTerm},s=await e.getContentItems(this.salesChannelId,this.activeTab,r);this.items=((a=s.data)==null?void 0:a.items)||[],this.totalItems=((t=s.data)==null?void 0:t.total)||0,this.totalPages=Math.ceil(this.totalItems/this.pageSize)||1}catch{this.items=[]}finally{this.isLoading=!1}}},onTabChange(a){this.activeTab!==a&&(this.activeTab=a,this.selectedItems=[],this.currentPage=1,this.$router.replace({params:{type:this.activeTab}}),this.loadItems())},onSearch(){this.currentPage=1,this.loadItems()},toggleItem(a){const t=this.selectedItems.indexOf(a);t>-1?this.selectedItems.splice(t,1):this.selectedItems.push(a)},toggleAll(){this.allSelected?this.selectedItems=[]:this.selectedItems=this.items.map(a=>a.id)},openTranslateModal(){this.selectedItems.length!==0&&(this.showTranslateModal=!0)},async onTranslate(a){this.showTranslateModal=!1,this.isLoading=!0;try{await Shopware.Service("falaraApiService").translate(a),this.selectedItems=[],Shopware.State.dispatch("notification/createNotification",{type:"success",message:this.$t("falara-translation-manager.general.success")})}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:this.$t("falara-translation-manager.general.error")})}finally{this.isLoading=!1}},prevPage(){this.currentPage>1&&(this.currentPage--,this.loadItems())},nextPage(){this.currentPage<this.totalPages&&(this.currentPage++,this.loadItems())},formatDate(a){return a?new Date(a).toLocaleString():"-"}}});const{Component:C}=Shopware;C.register("falara-jobs",{template:`
        <div class="falara-jobs">
            <falara-nav-tabs />
            <mt-card :title="$t('falara-translation-manager.jobs.title')">
                <div class="falara-jobs__toolbar">
                    <mt-switch
                        :label="$t('falara-translation-manager.jobs.showArchived')"
                        v-model="showArchived"
                        @change="loadJobs"
                    />
                    <span class="falara-jobs__auto-refresh">{{ $t('falara-translation-manager.jobs.autoRefresh') }}</span>
                </div>

                <mt-loader v-if="isLoading" />

                <div v-else>
                    <div v-if="jobs.length === 0">
                        <p>{{ $t('falara-translation-manager.jobs.noJobs') }}</p>
                    </div>

                    <div v-else>
                        <div v-for="(batchJobs, batchId) in groupedJobs" :key="batchId" class="falara-jobs__batch">
                            <div class="falara-jobs__batch-header">
                                <strong>{{ $t('falara-translation-manager.jobs.batchLabel') }}: {{ batchId }}</strong>
                                <span class="falara-jobs__batch-count">({{ batchJobs.length }})</span>
                            </div>
                            <table class="falara-jobs__table">
                                <thead>
                                    <tr>
                                        <th>{{ $t('falara-translation-manager.jobs.type') }}</th>
                                        <th>{{ $t('falara-translation-manager.jobs.status') }}</th>
                                        <th>{{ $t('falara-translation-manager.jobs.sourceLanguage') }}</th>
                                        <th>{{ $t('falara-translation-manager.jobs.targetLanguage') }}</th>
                                        <th>{{ $t('falara-translation-manager.jobs.itemCount') }}</th>
                                        <th>{{ $t('falara-translation-manager.jobs.createdAt') }}</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="job in batchJobs" :key="job.id" class="falara-jobs__row">
                                        <td>{{ job.contentType }}</td>
                                        <td><falara-status-badge :status="job.status" /></td>
                                        <td>{{ job.sourceLanguage }}</td>
                                        <td>{{ job.targetLanguage }}</td>
                                        <td>{{ job.itemCount }}</td>
                                        <td>{{ formatDate(job.createdAt) }}</td>
                                        <td class="falara-jobs__actions">
                                            <mt-button variant="ghost" size="small" @click="viewJob(job.id)">
                                                {{ $t('falara-translation-manager.jobs.viewDetail') }}
                                            </mt-button>
                                            <mt-button
                                                v-if="!job.archived"
                                                variant="ghost"
                                                size="small"
                                                @click="archiveJob(job.id)"
                                            >
                                                {{ $t('falara-translation-manager.jobs.archive') }}
                                            </mt-button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </mt-card>
        </div>
    `,data(){return{isLoading:!1,jobs:[],showArchived:!1,salesChannelId:null,pollInterval:null}},computed:{groupedJobs(){const a={};return this.jobs.forEach(t=>{const e=t.batchId||t.id;a[e]||(a[e]=[]),a[e].push(t)}),a}},created(){this.initSalesChannel()},beforeUnmount(){this.stopPolling()},methods:{async initSalesChannel(){const t=await Shopware.Service("repositoryFactory").create("sales_channel").search(new Shopware.Data.Criteria,Shopware.Context.api);t.length>0&&(this.salesChannelId=t.first().id,await this.loadJobs(),this.startPolling())},async loadJobs(){var a;if(this.salesChannelId){this.isLoading=!0;try{const t=Shopware.Service("falaraApiService"),e={archived:this.showArchived?"1":"0"},r=await t.getJobs(this.salesChannelId,e);this.jobs=((a=r.data)==null?void 0:a.items)||[]}catch{this.jobs=[]}finally{this.isLoading=!1}}},startPolling(){this.pollInterval=setInterval(()=>{this.loadJobs()},5e3)},stopPolling(){this.pollInterval&&(clearInterval(this.pollInterval),this.pollInterval=null)},viewJob(a){this.$router.push({name:"falara.translation.manager.job.detail",params:{id:a}})},async archiveJob(a){try{await Shopware.Service("falaraApiService").archiveJob(a),await this.loadJobs()}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:this.$t("falara-translation-manager.general.error")})}},formatDate(a){return a?new Date(a).toLocaleString():"-"}}});const{Component:_}=Shopware;_.register("falara-job-detail",{template:`
        <div class="falara-job-detail">
            <falara-nav-tabs />
            <mt-card :title="$t('falara-translation-manager.jobDetail.title')">
                <mt-button variant="ghost" @click="goBack" class="falara-job-detail__back">
                    ← {{ $t('falara-translation-manager.jobDetail.back') }}
                </mt-button>

                <mt-loader v-if="isLoading" />

                <div v-else-if="job">
                    <div
                        v-if="isZombie"
                        class="falara-job-detail__zombie-warning"
                    >
                        ⚠ {{ $t('falara-translation-manager.jobDetail.zombieWarning') }}
                    </div>

                    <div class="falara-job-detail__status-banner" :class="statusBannerClass">
                        <falara-status-badge :status="job.status" />
                    </div>

                    <div class="falara-job-detail__info">
                        <div class="falara-job-detail__info-row">
                            <span class="falara-job-detail__label">{{ $t('falara-translation-manager.jobDetail.sourceLanguage') }}</span>
                            <span>{{ job.sourceLanguage }}</span>
                        </div>
                        <div class="falara-job-detail__info-row">
                            <span class="falara-job-detail__label">{{ $t('falara-translation-manager.jobDetail.targetLanguage') }}</span>
                            <span>{{ job.targetLanguage }}</span>
                        </div>
                        <div class="falara-job-detail__info-row">
                            <span class="falara-job-detail__label">{{ $t('falara-translation-manager.jobDetail.itemCount') }}</span>
                            <span>{{ job.itemCount }}</span>
                        </div>
                        <div class="falara-job-detail__info-row" v-if="job.wordCount">
                            <span class="falara-job-detail__label">{{ $t('falara-translation-manager.jobDetail.wordCount') }}</span>
                            <span>{{ job.wordCount }}</span>
                        </div>
                        <div class="falara-job-detail__info-row">
                            <span class="falara-job-detail__label">{{ $t('falara-translation-manager.jobDetail.createdAt') }}</span>
                            <span>{{ formatDate(job.createdAt) }}</span>
                        </div>
                        <div class="falara-job-detail__info-row" v-if="job.completedAt">
                            <span class="falara-job-detail__label">{{ $t('falara-translation-manager.jobDetail.completedAt') }}</span>
                            <span>{{ formatDate(job.completedAt) }}</span>
                        </div>
                    </div>

                    <div class="falara-job-detail__actions" v-if="job.status === 'writeback_failed'">
                        <mt-button variant="primary" @click="retryWriteBack" :disabled="isRetrying">
                            {{ isRetrying ? $t('falara-translation-manager.general.loading') : $t('falara-translation-manager.jobDetail.retryWriteBack') }}
                        </mt-button>
                    </div>

                    <div class="falara-job-detail__errors" v-if="hasWriteBackErrors">
                        <div class="falara-job-detail__errors-header">
                            <h3>{{ $t('falara-translation-manager.jobDetail.writeBackErrors') }}</h3>
                            <mt-button variant="ghost" size="small" @click="showErrors = !showErrors">
                                {{ showErrors ? $t('falara-translation-manager.jobDetail.collapseErrors') : $t('falara-translation-manager.jobDetail.expandErrors') }}
                            </mt-button>
                        </div>
                        <div v-if="showErrors" class="falara-job-detail__errors-list">
                            <div
                                v-for="(error, idx) in job.writeBackErrors"
                                :key="idx"
                                class="falara-job-detail__error-item"
                            >
                                <span class="falara-job-detail__error-field">{{ error.field || error.entityId }}</span>
                                <span class="falara-job-detail__error-message">{{ error.message }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else>
                    <p>{{ $t('falara-translation-manager.general.noData') }}</p>
                </div>
            </mt-card>
        </div>
    `,data(){return{isLoading:!0,isRetrying:!1,job:null,showErrors:!1}},computed:{hasWriteBackErrors(){return this.job&&Array.isArray(this.job.writeBackErrors)&&this.job.writeBackErrors.length>0},isZombie(){if(!this.job||!["processing","writing_back"].includes(this.job.status))return!1;const a=new Date(this.job.updatedAt||this.job.createdAt);return(Date.now()-a.getTime())/1e3/60>10},statusBannerClass(){const a={pending:"falara-job-detail__status-banner--yellow",queued:"falara-job-detail__status-banner--yellow",processing:"falara-job-detail__status-banner--blue",writing_back:"falara-job-detail__status-banner--blue",completed:"falara-job-detail__status-banner--green",written_back:"falara-job-detail__status-banner--green",needs_review:"falara-job-detail__status-banner--green",failed:"falara-job-detail__status-banner--red",dead:"falara-job-detail__status-banner--red",writeback_failed:"falara-job-detail__status-banner--red"};return this.job&&a[this.job.status]||""}},created(){this.loadJob()},methods:{async loadJob(){this.isLoading=!0;try{const t=await Shopware.Service("falaraApiService").getJob(this.$route.params.id);this.job=t.data||null}catch{this.job=null}finally{this.isLoading=!1}},async retryWriteBack(){this.isRetrying=!0;try{await Shopware.Service("falaraApiService").retryWriteBack(this.job.id),await this.loadJob(),Shopware.State.dispatch("notification/createNotification",{type:"success",message:this.$t("falara-translation-manager.general.success")})}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:this.$t("falara-translation-manager.general.error")})}finally{this.isRetrying=!1}},goBack(){this.$router.push({name:"falara.translation.manager.jobs"})},formatDate(a){return a?new Date(a).toLocaleString():"-"}}});const{Component:j}=Shopware;j.register("falara-audit",{template:`
        <div class="falara-audit">
            <falara-nav-tabs />
            <mt-card :title="$t('falara-translation-manager.audit.title')">
                <p class="falara-audit__description">{{ $t('falara-translation-manager.audit.description') }}</p>

                <mt-button
                    variant="primary"
                    :disabled="isScanning"
                    @click="runScan"
                    class="falara-audit__scan-btn"
                >
                    {{ isScanning ? $t('falara-translation-manager.audit.scanning') : $t('falara-translation-manager.audit.runScan') }}
                </mt-button>

                <mt-loader v-if="isScanning" />

                <div v-else-if="results" class="falara-audit__results">
                    <h3>{{ $t('falara-translation-manager.audit.results') }}</h3>

                    <div v-if="results.recommendation" class="falara-audit__recommendation">
                        {{ $t('falara-translation-manager.audit.planRecommendation', { plan: results.recommendation }) }}
                    </div>

                    <div class="falara-audit__breakdown">
                        <div v-for="(langData, langCode) in results.byLanguage" :key="langCode" class="falara-audit__language-section">
                            <h4>{{ langCode }}</h4>
                            <table class="falara-audit__table">
                                <thead>
                                    <tr>
                                        <th>{{ $t('falara-translation-manager.audit.type') }}</th>
                                        <th>{{ $t('falara-translation-manager.audit.total') }}</th>
                                        <th>{{ $t('falara-translation-manager.audit.missing') }}</th>
                                        <th>{{ $t('falara-translation-manager.audit.coverage') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(typeData, typeName) in langData" :key="typeName">
                                        <td>{{ typeName }}</td>
                                        <td>{{ typeData.total }}</td>
                                        <td>{{ typeData.missing }}</td>
                                        <td>{{ coveragePercent(typeData) }}%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div v-else class="falara-audit__empty">
                    <p>{{ $t('falara-translation-manager.audit.noResults') }}</p>
                </div>
            </mt-card>
        </div>
    `,data(){return{isScanning:!1,results:null,salesChannelId:null}},created(){this.initSalesChannel()},methods:{async initSalesChannel(){const t=await Shopware.Service("repositoryFactory").create("sales_channel").search(new Shopware.Data.Criteria,Shopware.Context.api);t.length>0&&(this.salesChannelId=t.first().id)},async runScan(){if(this.salesChannelId){this.isScanning=!0,this.results=null;try{const t=await Shopware.Service("falaraApiService").runAudit(this.salesChannelId);this.results=t.data||{}}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:this.$t("falara-translation-manager.general.error")})}finally{this.isScanning=!1}}},coveragePercent(a){if(!a.total||a.total===0)return 100;const t=a.total-(a.missing||0);return Math.round(t/a.total*100)}}});const{Component:x}=Shopware;x.register("falara-settings",{template:`
        <div class="falara-settings">
            <falara-nav-tabs />
            <mt-card :title="$t('falara-translation-manager.settings.title')">
                <mt-tabs
                    :items="tabItems"
                    v-model="activeTab"
                    @change="onTabChange"
                />

                <mt-loader v-if="isLoading" />

                <div v-else>
                    <!-- Connection Tab -->
                    <div v-show="activeTab === 'connection'" class="falara-settings__tab-content">
                        <h3>{{ $t('falara-translation-manager.settings.connection.title') }}</h3>

                        <div class="falara-settings__status">
                            <span class="falara-settings__status-label">{{ $t('falara-translation-manager.settings.connection.status') }}:</span>
                            <span v-if="isConnected" class="falara-settings__status--connected">
                                {{ $t('falara-translation-manager.settings.connection.connected') }}
                                <span v-if="connectionData.account"> — {{ $t('falara-translation-manager.settings.connection.connectedAs', { account: connectionData.account }) }}</span>
                            </span>
                            <span v-else class="falara-settings__status--disconnected">
                                {{ $t('falara-translation-manager.settings.connection.notConnected') }}
                            </span>
                        </div>

                        <div v-if="!isConnected" class="falara-settings__connect-form">
                            <mt-text-field
                                :label="$t('falara-translation-manager.settings.connection.apiKey')"
                                :placeholder="$t('falara-translation-manager.settings.connection.apiKeyPlaceholder')"
                                v-model="connectForm.apiKey"
                                type="password"
                            />
                            <mt-button
                                variant="primary"
                                :disabled="!connectForm.apiKey || isConnecting"
                                @click="connect"
                            >
                                {{ isConnecting ? $t('falara-translation-manager.general.loading') : $t('falara-translation-manager.settings.connection.connect') }}
                            </mt-button>
                        </div>

                        <div v-else class="falara-settings__disconnect">
                            <mt-button
                                variant="danger"
                                :disabled="isDisconnecting"
                                @click="confirmDisconnect"
                            >
                                {{ isDisconnecting ? $t('falara-translation-manager.general.loading') : $t('falara-translation-manager.settings.connection.disconnect') }}
                            </mt-button>
                        </div>

                        <div v-if="showDisconnectConfirm" class="falara-settings__confirm-dialog">
                            <p>{{ $t('falara-translation-manager.settings.connection.disconnectConfirm') }}</p>
                            <mt-button variant="danger" @click="disconnect">{{ $t('falara-translation-manager.general.yes') }}</mt-button>
                            <mt-button variant="ghost" @click="showDisconnectConfirm = false">{{ $t('falara-translation-manager.general.no') }}</mt-button>
                        </div>
                    </div>

                    <!-- Custom Fields Tab -->
                    <div v-show="activeTab === 'customFields'" class="falara-settings__tab-content">
                        <h3>{{ $t('falara-translation-manager.settings.customFields.title') }}</h3>
                        <p>{{ $t('falara-translation-manager.settings.customFields.description') }}</p>

                        <div class="falara-settings__custom-fields-form">
                            <mt-text-field
                                :label="$t('falara-translation-manager.settings.customFields.fieldName')"
                                v-model="newFieldName"
                            />
                            <mt-button variant="primary" @click="addCustomField" :disabled="!newFieldName">
                                {{ $t('falara-translation-manager.settings.customFields.addField') }}
                            </mt-button>
                        </div>

                        <div v-if="customFields.length === 0" class="falara-settings__empty">
                            <p>{{ $t('falara-translation-manager.settings.customFields.noFields') }}</p>
                        </div>
                        <ul v-else class="falara-settings__custom-fields-list">
                            <li v-for="(field, idx) in customFields" :key="idx" class="falara-settings__custom-field-item">
                                <span>{{ field }}</span>
                                <mt-button variant="ghost" size="small" @click="removeCustomField(idx)">
                                    {{ $t('falara-translation-manager.settings.customFields.removeField') }}
                                </mt-button>
                            </li>
                        </ul>

                        <mt-button variant="primary" @click="saveCustomFields" :disabled="isSaving">
                            {{ isSaving ? $t('falara-translation-manager.general.loading') : $t('falara-translation-manager.general.save') }}
                        </mt-button>
                    </div>

                    <!-- Defaults Tab -->
                    <div v-show="activeTab === 'defaults'" class="falara-settings__tab-content">
                        <h3>{{ $t('falara-translation-manager.settings.defaults.title') }}</h3>

                        <mt-text-field
                            :label="$t('falara-translation-manager.settings.defaults.sourceLanguage')"
                            v-model="defaults.sourceLanguage"
                        />

                        <mt-text-field
                            :label="$t('falara-translation-manager.settings.defaults.domain')"
                            v-model="defaults.domain"
                        />

                        <mt-text-field
                            :label="$t('falara-translation-manager.settings.defaults.tone')"
                            v-model="defaults.tone"
                        />

                        <mt-select
                            :label="$t('falara-translation-manager.settings.defaults.quality')"
                            v-model="defaults.quality"
                            :options="qualityOptions"
                        />

                        <mt-select
                            :label="$t('falara-translation-manager.settings.defaults.provider')"
                            v-model="defaults.provider"
                            :options="providerOptions"
                        />

                        <mt-textarea
                            :label="$t('falara-translation-manager.settings.defaults.instructions')"
                            v-model="defaults.instructions"
                        />

                        <mt-button variant="primary" @click="saveDefaults" :disabled="isSaving">
                            {{ isSaving ? $t('falara-translation-manager.general.loading') : $t('falara-translation-manager.settings.defaults.save') }}
                        </mt-button>
                    </div>
                </div>
            </mt-card>
        </div>
    `,data(){return{isLoading:!0,isSaving:!1,isConnecting:!1,isDisconnecting:!1,activeTab:"connection",isConnected:!1,connectionData:{},showDisconnectConfirm:!1,connectForm:{apiKey:""},customFields:[],newFieldName:"",defaults:{sourceLanguage:"",domain:"",tone:"",quality:"standard",provider:"",instructions:""},salesChannelId:null}},computed:{tabItems(){return[{name:"connection",label:this.$t("falara-translation-manager.settings.tabs.connection")},{name:"customFields",label:this.$t("falara-translation-manager.settings.tabs.customFields")},{name:"defaults",label:this.$t("falara-translation-manager.settings.tabs.defaults")}]},qualityOptions(){return[{value:"draft",label:"Draft"},{value:"standard",label:"Standard"},{value:"premium",label:"Premium"}]},providerOptions(){return[{value:"deepl",label:"DeepL"},{value:"claude",label:"Claude"},{value:"gemini",label:"Gemini"},{value:"chatgpt",label:"ChatGPT"}]}},created(){this.initSalesChannel()},methods:{async initSalesChannel(){const t=await Shopware.Service("repositoryFactory").create("sales_channel").search(new Shopware.Data.Criteria,Shopware.Context.api);t.length>0?(this.salesChannelId=t.first().id,await this.loadAll()):this.isLoading=!1},async loadAll(){this.isLoading=!0;try{await Promise.all([this.loadConnection(),this.loadDefaults(),this.loadCustomFields()])}finally{this.isLoading=!1}},async loadConnection(){try{const t=await Shopware.Service("falaraApiService").getConnection(this.salesChannelId);this.connectionData=t.data||{},this.isConnected=!!(t.data&&t.data.connected)}catch{this.isConnected=!1,this.connectionData={}}},async loadDefaults(){try{const t=await Shopware.Service("falaraApiService").getDefaults(this.salesChannelId);t.data&&(this.defaults={...this.defaults,...t.data})}catch{}},async loadCustomFields(){var a;try{const e=await Shopware.Service("falaraApiService").getCustomFields(this.salesChannelId);this.customFields=((a=e.data)==null?void 0:a.fields)||[]}catch{this.customFields=[]}},onTabChange(a){this.activeTab=typeof a=="object"?a.name:a},async connect(){this.isConnecting=!0;try{await Shopware.Service("falaraApiService").connect(this.salesChannelId,this.connectForm.apiKey),this.connectForm.apiKey="",await this.loadConnection(),Shopware.State.dispatch("notification/createNotification",{type:"success",message:this.$t("falara-translation-manager.general.success")})}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:this.$t("falara-translation-manager.general.error")})}finally{this.isConnecting=!1}},confirmDisconnect(){this.showDisconnectConfirm=!0},async disconnect(){this.showDisconnectConfirm=!1,this.isDisconnecting=!0;try{await Shopware.Service("falaraApiService").disconnect(this.salesChannelId),await this.loadConnection(),Shopware.State.dispatch("notification/createNotification",{type:"success",message:this.$t("falara-translation-manager.general.success")})}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:this.$t("falara-translation-manager.general.error")})}finally{this.isDisconnecting=!1}},addCustomField(){this.newFieldName&&(this.customFields.includes(this.newFieldName)||this.customFields.push(this.newFieldName),this.newFieldName="")},removeCustomField(a){this.customFields.splice(a,1)},async saveCustomFields(){this.isSaving=!0;try{await Shopware.Service("falaraApiService").saveCustomFields(this.salesChannelId,this.customFields),Shopware.State.dispatch("notification/createNotification",{type:"success",message:this.$t("falara-translation-manager.general.success")})}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:this.$t("falara-translation-manager.general.error")})}finally{this.isSaving=!1}},async saveDefaults(){this.isSaving=!0;try{await Shopware.Service("falaraApiService").saveDefaults(this.salesChannelId,this.defaults),Shopware.State.dispatch("notification/createNotification",{type:"success",message:this.$t("falara-translation-manager.general.success")})}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:this.$t("falara-translation-manager.general.error")})}finally{this.isSaving=!1}}}});const{Component:k}=Shopware;k.register("falara-status-badge",{template:`
        <div class="falara-status-badge" :class="badgeClass" :title="tooltipText">
            <span class="falara-status-badge__dot"></span>
            <span class="falara-status-badge__label">{{ labelText }}</span>
        </div>
    `,props:{status:{type:String,required:!0}},computed:{badgeClass(){return{pending:"falara-status-badge--yellow",queued:"falara-status-badge--yellow",processing:"falara-status-badge--blue",writing_back:"falara-status-badge--blue",completed:"falara-status-badge--green",written_back:"falara-status-badge--green",needs_review:"falara-status-badge--green",failed:"falara-status-badge--red",dead:"falara-status-badge--red",writeback_failed:"falara-status-badge--red"}[this.status]||"falara-status-badge--grey"},labelText(){const a=`falara-translation-manager.status.${this.status}`;return this.$t(a)},tooltipText(){const a=`falara-translation-manager.status.${this.status}_tooltip`;return this.$t(a)}}});const{Component:A}=Shopware;A.register("falara-quota-widget",{template:`
        <div class="falara-quota-widget">
            <div class="falara-quota-widget__header">
                <span class="falara-quota-widget__plan">{{ $t('falara-translation-manager.quota.plan') }}: <strong>{{ usage.plan || '-' }}</strong></span>
                <span class="falara-quota-widget__numbers">{{ usage.used || 0 }} / {{ usage.limit || 0 }}</span>
            </div>
            <mt-progress-bar
                :value="progressValue"
                :max="100"
            />
            <div v-if="isExceeded" class="falara-quota-widget__alert falara-quota-widget__alert--danger">
                {{ $t('falara-translation-manager.quota.exceeded') }}
            </div>
            <div v-else-if="isWarning" class="falara-quota-widget__alert falara-quota-widget__alert--warning">
                {{ $t('falara-translation-manager.quota.warningThreshold') }}
            </div>
            <div class="falara-quota-widget__remaining">
                {{ $t('falara-translation-manager.quota.remaining') }}: {{ remaining }}
            </div>
        </div>
    `,props:{usage:{type:Object,required:!0,default:()=>({plan:"",used:0,limit:0})}},computed:{progressValue(){return!this.usage.limit||this.usage.limit===0?0:Math.min(Math.round(this.usage.used/this.usage.limit*100),100)},isWarning(){return this.progressValue>=80&&this.progressValue<100},isExceeded(){return this.progressValue>=100},remaining(){const a=(this.usage.limit||0)-(this.usage.used||0);return Math.max(a,0)}}});const{Component:I}=Shopware;I.register("falara-translate-modal",{template:`
        <div class="falara-translate-modal">
            <div class="falara-translate-modal__summary">
                <p>{{ $t('falara-translation-manager.modal.itemCount', { count: items.length }) }}</p>
            </div>

            <div class="falara-translate-modal__languages">
                <h3>{{ $t('falara-translation-manager.modal.targetLanguages') }}</h3>
                <div v-for="lang in availableLanguages" :key="lang.id" class="falara-translate-modal__lang-option">
                    <mt-checkbox
                        :label="lang.name"
                        :checked="selectedLanguages.includes(lang.id)"
                        @change="toggleLanguage(lang.id)"
                    />
                </div>
            </div>

            <div class="falara-translate-modal__glossary">
                <mt-select
                    :label="$t('falara-translation-manager.modal.glossary')"
                    v-model="selectedGlossary"
                    :options="glossaryOptions"
                />
            </div>

            <div class="falara-translate-modal__advanced">
                <button class="falara-translate-modal__toggle" @click="showAdvanced = !showAdvanced">
                    {{ $t('falara-translation-manager.modal.advancedOptions') }}
                    <span>{{ showAdvanced ? '▲' : '▼' }}</span>
                </button>
                <div v-if="showAdvanced" class="falara-translate-modal__advanced-content">
                    <mt-text-field
                        :label="$t('falara-translation-manager.modal.domain')"
                        v-model="form.domain"
                    />
                    <mt-text-field
                        :label="$t('falara-translation-manager.modal.tone')"
                        v-model="form.tone"
                    />
                    <mt-select
                        :label="$t('falara-translation-manager.modal.quality')"
                        v-model="form.quality"
                        :options="qualityOptions"
                    />
                    <mt-textarea
                        :label="$t('falara-translation-manager.modal.instructions')"
                        v-model="form.instructions"
                    />
                </div>
            </div>

            <div class="falara-translate-modal__actions">
                <mt-button variant="ghost" @click="$emit('cancel')">
                    {{ $t('falara-translation-manager.modal.cancel') }}
                </mt-button>
                <mt-button
                    variant="primary"
                    :disabled="selectedLanguages.length === 0"
                    @click="onTranslate"
                >
                    {{ $t('falara-translation-manager.modal.translate') }}
                </mt-button>
            </div>
        </div>
    `,emits:["translate","cancel"],props:{items:{type:Array,required:!0,default:()=>[]},salesChannelId:{type:String,required:!0},defaults:{type:Object,default:()=>({})}},data(){return{selectedLanguages:[],selectedGlossary:null,showAdvanced:!1,availableLanguages:[],glossaries:[],form:{domain:"",tone:"",quality:"standard",instructions:""}}},computed:{glossaryOptions(){return[{value:null,label:this.$t("falara-translation-manager.modal.noGlossary")}].concat(this.glossaries.map(t=>({value:t.id,label:t.name})))},qualityOptions(){return[{value:"draft",label:"Draft"},{value:"standard",label:"Standard"},{value:"premium",label:"Premium"}]}},created(){this.loadLanguages(),this.loadGlossaries(),this.applyDefaults()},methods:{applyDefaults(){this.defaults&&(this.form.domain=this.defaults.domain||"",this.form.tone=this.defaults.tone||"",this.form.quality=this.defaults.quality||"standard",this.form.instructions=this.defaults.instructions||"",this.defaults.targetLanguages&&(this.selectedLanguages=[...this.defaults.targetLanguages]),this.defaults.glossaryId&&(this.selectedGlossary=this.defaults.glossaryId))},loadLanguages(){Shopware.Service("repositoryFactory").create("language").search(Shopware.Data.Criteria.fromCriteria({associations:["locale"]}),Shopware.Context.api).then(t=>{this.availableLanguages=t.map(e=>({id:e.id,name:e.name}))}).catch(()=>{this.availableLanguages=[]})},loadGlossaries(){Shopware.Service("falaraApiService").getGlossaries(this.salesChannelId).then(t=>{this.glossaries=t.data||[]}).catch(()=>{this.glossaries=[]})},toggleLanguage(a){const t=this.selectedLanguages.indexOf(a);t>-1?this.selectedLanguages.splice(t,1):this.selectedLanguages.push(a)},onTranslate(){this.selectedLanguages.length!==0&&this.$emit("translate",{items:this.items,salesChannelId:this.salesChannelId,targetLanguages:this.selectedLanguages,glossaryId:this.selectedGlossary,...this.form})}}});const{Component:D}=Shopware;D.register("falara-nav-tabs",{template:`
        <div :style="containerStyle">
            <div :style="headerStyle">
                <h1 :style="titleStyle">Falara Translation Manager</h1>
            </div>
            <nav :style="barStyle">
                <button
                    v-for="tab in tabs"
                    :key="tab.route"
                    :style="isActive(tab.route) ? activeTabStyle : tabStyle"
                    @click="navigate(tab.route)"
                    @mouseenter="$event.target.style.color = '#1a73e8'; $event.target.style.background = '#f0f4ff'"
                    @mouseleave="!isActive(tab.route) && ($event.target.style.color = '#6b7280', $event.target.style.background = 'none')"
                >
                    {{ $t(tab.label) }}
                </button>
            </nav>
        </div>
    `,computed:{containerStyle(){return{background:"#fff",borderBottom:"1px solid #d1d5db",margin:"-20px -20px 24px -20px",padding:"0",borderRadius:"8px 8px 0 0"}},headerStyle(){return{padding:"24px 32px 0 32px"}},titleStyle(){return{fontSize:"24px",fontWeight:"700",color:"#1a1a2e",margin:"0 0 16px 0",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},barStyle(){return{display:"flex",gap:"0",padding:"0 32px",borderTop:"1px solid #e5e7eb"}},tabStyle(){return{background:"none",border:"none",borderBottom:"3px solid transparent",padding:"14px 20px",cursor:"pointer",fontSize:"14px",fontWeight:"500",color:"#6b7280",whiteSpace:"nowrap",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif",transition:"all 0.15s ease"}},activeTabStyle(){return{...this.tabStyle,color:"#1a73e8",borderBottomColor:"#1a73e8",fontWeight:"600"}},tabs(){return[{route:"falara.translation.manager.dashboard",label:"falara-translation-manager.nav.dashboard"},{route:"falara.translation.manager.content",label:"falara-translation-manager.nav.content"},{route:"falara.translation.manager.jobs",label:"falara-translation-manager.nav.jobs"},{route:"falara.translation.manager.audit",label:"falara-translation-manager.nav.audit"},{route:"falara.translation.manager.settings",label:"falara-translation-manager.nav.settings"}]}},methods:{isActive(a){const t=this.$route.name;return t?t===a||a==="falara.translation.manager.jobs"&&t==="falara.translation.manager.job-detail":!1},navigate(a){this.isActive(a)||this.$router.push({name:a})}}});const{Module:T}=Shopware;T.register("falara-translation-manager",{type:"plugin",name:"falara-translation-manager.general.title",title:"falara-translation-manager.general.title",description:"falara-translation-manager.general.description",color:"#1a73e8",icon:"regular-language",snippets:{"de-DE":()=>m(()=>import("./de-DE-CTLn2U6y.js"),[]),"en-GB":()=>m(()=>import("./en-GB-Cpj3ozAp.js"),[])},routes:{dashboard:{component:"falara-dashboard",path:"dashboard"},content:{component:"falara-content",path:"content/:type?"},jobs:{component:"falara-jobs",path:"jobs"},"job-detail":{component:"falara-job-detail",path:"jobs/:id"},audit:{component:"falara-audit",path:"audit"},settings:{component:"falara-settings",path:"settings"}},navigation:[{label:"falara-translation-manager.general.title",color:"#1a73e8",icon:"regular-language",path:"falara.translation.manager.dashboard",parent:"sw-settings",position:100}]});
//# sourceMappingURL=falara-translation-manager-CPHzPVEC.js.map
