const{Application:h}=Shopware;class y{constructor(t,e){this.httpClient=t,this.loginService=e,this.basePath="_action/falara"}getHeaders(){return{Authorization:`Bearer ${this.loginService.getToken()}`,"Content-Type":"application/json"}}connect(t,e){return this.httpClient.post(`${this.basePath}/connect`,{salesChannelId:t,apiKey:e},{headers:this.getHeaders()})}disconnect(t){return this.httpClient.post(`${this.basePath}/disconnect`,{salesChannelId:t},{headers:this.getHeaders()})}getConnection(t){return this.httpClient.get(`${this.basePath}/connection/${t}`,{headers:this.getHeaders()})}getUsage(t){return this.httpClient.get(`${this.basePath}/settings/usage/${t}`,{headers:this.getHeaders()})}getContentItems(t,e,n={}){return this.httpClient.get(`${this.basePath}/content/${t}/${e}`,{params:n,headers:this.getHeaders()})}getContentTypes(){return this.httpClient.get(`${this.basePath}/content-types`,{headers:this.getHeaders()})}translate(t){return this.httpClient.post(`${this.basePath}/translate`,t,{headers:this.getHeaders()})}getJobs(t,e={}){return this.httpClient.get(`${this.basePath}/jobs/${t}`,{params:e,headers:this.getHeaders()})}getJob(t){return this.httpClient.get(`${this.basePath}/jobs/detail/${t}`,{headers:this.getHeaders()})}retryWriteBack(t){return this.httpClient.post(`${this.basePath}/jobs/${t}/retry`,{},{headers:this.getHeaders()})}archiveJob(t){return this.httpClient.patch(`${this.basePath}/jobs/${t}/archive`,{},{headers:this.getHeaders()})}runAudit(t){return this.httpClient.get(`${this.basePath}/audit/${t}`,{headers:this.getHeaders()})}getDefaults(t){return this.httpClient.get(`${this.basePath}/settings/defaults/${t}`,{headers:this.getHeaders()})}saveDefaults(t,e){return this.httpClient.post(`${this.basePath}/settings/defaults/${t}`,e,{headers:this.getHeaders()})}getGlossaries(t){return this.httpClient.get(`${this.basePath}/settings/glossaries/${t}`,{headers:this.getHeaders()})}getCustomFields(t){return this.httpClient.get(`${this.basePath}/settings/custom-fields/${t}`,{headers:this.getHeaders()})}addCustomField(t,e,n){return this.httpClient.post(`${this.basePath}/settings/custom-fields/${t}`,{fieldSetName:e,fieldName:n},{headers:this.getHeaders()})}deleteCustomField(t){return this.httpClient.delete(`${this.basePath}/settings/custom-fields/entry/${t}`,{headers:this.getHeaders()})}}h.addServiceProvider("falaraApiService",a=>{const t=h.getContainer("init");return new y(t.httpClient,a.loginService)});const v="modulepreload",S=function(a){return window.__sw__.assetPath+"/bundles/falaratranslationmanager/administration/"+a},u={},g=function(t,e,n){let s=Promise.resolve();if(e&&e.length>0){let r=function(l){return Promise.all(l.map(c=>Promise.resolve(c).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};document.getElementsByTagName("link");const i=document.querySelector("meta[property=csp-nonce]"),f=(i==null?void 0:i.nonce)||(i==null?void 0:i.getAttribute("nonce"));s=r(e.map(l=>{if(l=S(l),l in u)return;u[l]=!0;const c=l.endsWith(".css"),p=c?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${p}`))return;const d=document.createElement("link");if(d.rel=c?"stylesheet":v,c||(d.as="script"),d.crossOrigin="",d.href=l,f&&d.setAttribute("nonce",f),document.head.appendChild(d),c)return new Promise((m,b)=>{d.addEventListener("load",m),d.addEventListener("error",()=>b(new Error(`Unable to preload CSS for ${l}`)))})}))}function o(r){const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=r,window.dispatchEvent(i),!i.defaultPrevented)throw r}return s.then(r=>{for(const i of r||[])i.status==="rejected"&&o(i.reason);return t().catch(o)})},{Component:x}=Shopware;x.register("falara-dashboard",{template:`
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
    `,data(){return{isLoading:!0,isConnected:!1,usage:null,recentJobs:[],stats:{total:0,completed:0,failed:0,pending:0},salesChannelId:null}},computed:{cardStyle(){return{background:"#ffffff",borderRadius:"10px",padding:"24px",boxShadow:"0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)",marginBottom:"24px",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},statCardStyle(){return{background:"#ffffff",borderRadius:"8px",padding:"20px",border:"1px solid #e5e7eb",display:"flex",flexDirection:"column",gap:"6px",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},statValueStyle(){return{fontSize:"32px",fontWeight:"700",color:"#1a1a2e",lineHeight:"1"}},statLabelStyle(){return{fontSize:"13px",color:"#6b7280",fontWeight:"500"}},tableStyle(){return{width:"100%",borderCollapse:"collapse",fontSize:"14px"}},thStyle(){return{textAlign:"left",padding:"10px 14px",fontSize:"11px",fontWeight:"600",color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em",background:"#f3f4f6",borderBottom:"1px solid #e5e7eb"}},tdStyle(){return{padding:"12px 14px",color:"#374151",borderBottom:"1px solid #f3f4f6",verticalAlign:"middle"}},tdRowEvenStyle(){return{background:"#ffffff"}},tdRowOddStyle(){return{background:"#f9fafb"}}},created(){this.loadDashboard()},methods:{async loadDashboard(){var a;this.isLoading=!0;try{const e=await Shopware.Service("repositoryFactory").create("sales_channel").search(new Shopware.Data.Criteria,Shopware.Context.api);if(e.length===0){this.isConnected=!1;return}this.salesChannelId=e.first().id;const n=Shopware.Service("falaraApiService");try{const s=await n.getConnection(this.salesChannelId);this.isConnected=!!(s.data&&s.data.connection&&!s.data.connection.disconnectedAt)}catch{this.isConnected=!1}if(this.isConnected){try{const s=await n.getUsage(this.salesChannelId);this.usage=s.data||{}}catch{this.usage={}}try{const o=((a=(await n.getJobs(this.salesChannelId,{limit:10})).data)==null?void 0:a.items)||[];this.recentJobs=o.slice(0,5),this.stats.total=o.length,this.stats.completed=o.filter(r=>["completed","written_back"].includes(r.status)).length,this.stats.failed=o.filter(r=>["failed","dead","writeback_failed"].includes(r.status)).length,this.stats.pending=o.filter(r=>["pending","queued","processing"].includes(r.status)).length}catch{this.recentJobs=[]}}}finally{this.isLoading=!1}},formatDate(a){return a?new Date(a).toLocaleString():"-"},goToSettings(){this.$router.push({name:"falara.translation.manager.settings"})},goToJobs(){this.$router.push({name:"falara.translation.manager.jobs"})},goToJob(a){this.$router.push({name:"falara.translation.manager.job.detail",params:{id:a}})}}});const{Component:w}=Shopware;w.register("falara-content",{template:`
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
                                <th :style="{ ...thStyle, width: '40px' }">
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
    `,data(){return{isLoading:!1,activeTab:"product",hoverTab:null,searchTerm:"",items:[],selectedItems:[],currentPage:1,totalPages:1,pageSize:25,totalItems:0,showTranslateModal:!1,salesChannelId:null,translationDefaults:{}}},computed:{tabItems(){return[{name:"product",label:this.$t("falara-translation-manager.content.product")},{name:"category",label:this.$t("falara-translation-manager.content.category")},{name:"cms_page",label:this.$t("falara-translation-manager.content.cms_page")},{name:"snippet",label:this.$t("falara-translation-manager.content.snippet")}]},allSelected(){return this.items.length>0&&this.items.every(a=>this.selectedItems.includes(a.id))},selectedItemObjects(){return this.items.filter(a=>this.selectedItems.includes(a.id))},tabBarStyle(){return{display:"flex",gap:"4px",marginBottom:"20px",background:"#f3f4f6",borderRadius:"8px",padding:"4px",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},tabBtnStyle(){return{background:"none",border:"none",borderRadius:"6px",padding:"8px 18px",cursor:"pointer",fontSize:"14px",fontWeight:"500",color:"#6b7280",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif",transition:"all 0.15s ease"}},activeTabBtnStyle(){return{...this.tabBtnStyle,background:"#ffffff",color:"#1a73e8",fontWeight:"600",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}},tableWrapStyle(){return{background:"#ffffff",borderRadius:"8px",border:"1px solid #e5e7eb",overflow:"hidden"}},tableStyle(){return{width:"100%",borderCollapse:"collapse",fontSize:"14px",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},thStyle(){return{textAlign:"left",padding:"10px 16px",fontSize:"11px",fontWeight:"600",color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em",background:"#f9fafb",borderBottom:"2px solid #e5e7eb"}},tdStyle(){return{padding:"12px 16px",color:"#374151",borderBottom:"1px solid #f3f4f6",verticalAlign:"middle"}},tdRowEvenStyle(){return{background:"#ffffff"}},tdRowOddStyle(){return{background:"#f9fafb"}},modalOverlayStyle(){return{position:"fixed",top:"0",left:"0",width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:"1000"}},modalStyle(){return{width:"600px",maxWidth:"90vw",maxHeight:"90vh",overflow:"auto"}}},created(){this.activeTab=this.$route.params.type||"product",this.initSalesChannel()},methods:{async initSalesChannel(){const t=await Shopware.Service("repositoryFactory").create("sales_channel").search(new Shopware.Data.Criteria,Shopware.Context.api);t.length>0&&(this.salesChannelId=t.first().id,await this.loadDefaults(),await this.loadItems())},async loadDefaults(){if(this.salesChannelId)try{const t=await Shopware.Service("falaraApiService").getDefaults(this.salesChannelId);this.translationDefaults=t.data||{}}catch{this.translationDefaults={}}},async loadItems(){var a,t;if(this.salesChannelId){this.isLoading=!0;try{const e=Shopware.Service("falaraApiService"),n={page:this.currentPage,limit:this.pageSize,search:this.searchTerm},s=await e.getContentItems(this.salesChannelId,this.activeTab,n);this.items=((a=s.data)==null?void 0:a.items)||[],this.totalItems=((t=s.data)==null?void 0:t.total)||0,this.totalPages=Math.ceil(this.totalItems/this.pageSize)||1}catch{this.items=[]}finally{this.isLoading=!1}}},onTabChange(a){this.activeTab!==a&&(this.activeTab=a,this.selectedItems=[],this.currentPage=1,this.$router.replace({params:{type:this.activeTab}}),this.loadItems())},onSearch(){this.currentPage=1,this.loadItems()},toggleItem(a){const t=this.selectedItems.indexOf(a);t>-1?this.selectedItems.splice(t,1):this.selectedItems.push(a)},toggleAll(){this.allSelected?this.selectedItems=[]:this.selectedItems=this.items.map(a=>a.id)},openTranslateModal(){this.selectedItems.length!==0&&(this.showTranslateModal=!0)},async onTranslate(a){this.showTranslateModal=!1,this.isLoading=!0;try{await Shopware.Service("falaraApiService").translate(a),this.selectedItems=[],Shopware.State.dispatch("notification/createNotification",{type:"success",message:this.$t("falara-translation-manager.general.success")})}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:this.$t("falara-translation-manager.general.error")})}finally{this.isLoading=!1}},prevPage(){this.currentPage>1&&(this.currentPage--,this.loadItems())},nextPage(){this.currentPage<this.totalPages&&(this.currentPage++,this.loadItems())},formatDate(a){return a?new Date(a).toLocaleString():"-"}}});const{Component:C}=Shopware;C.register("falara-jobs",{template:`
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
    `,data(){return{isLoading:!1,jobs:[],showArchived:!1,salesChannelId:null,pollInterval:null}},computed:{groupedJobs(){const a={};return this.jobs.forEach(t=>{const e=t.batchId||t.id;a[e]||(a[e]=[]),a[e].push(t)}),a}},created(){this.initSalesChannel()},beforeUnmount(){this.stopPolling()},methods:{async initSalesChannel(){const t=await Shopware.Service("repositoryFactory").create("sales_channel").search(new Shopware.Data.Criteria,Shopware.Context.api);t.length>0&&(this.salesChannelId=t.first().id,await this.loadJobs(),this.startPolling())},async loadJobs(){var a;if(this.salesChannelId){this.isLoading=!0;try{const t=Shopware.Service("falaraApiService"),e={archived:this.showArchived?"1":"0"},n=await t.getJobs(this.salesChannelId,e);this.jobs=((a=n.data)==null?void 0:a.items)||[]}catch{this.jobs=[]}finally{this.isLoading=!1}}},startPolling(){this.pollInterval=setInterval(()=>{this.loadJobs()},5e3)},stopPolling(){this.pollInterval&&(clearInterval(this.pollInterval),this.pollInterval=null)},viewJob(a){this.$router.push({name:"falara.translation.manager.job.detail",params:{id:a}})},async archiveJob(a){try{await Shopware.Service("falaraApiService").archiveJob(a),await this.loadJobs()}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:this.$t("falara-translation-manager.general.error")})}},formatDate(a){return a?new Date(a).toLocaleString():"-"}}});const{Component:$}=Shopware;$.register("falara-job-detail",{template:`
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
    `,data(){return{isScanning:!1,results:null,salesChannelId:null}},created(){this.initSalesChannel()},methods:{async initSalesChannel(){const t=await Shopware.Service("repositoryFactory").create("sales_channel").search(new Shopware.Data.Criteria,Shopware.Context.api);t.length>0&&(this.salesChannelId=t.first().id)},async runScan(){if(this.salesChannelId){this.isScanning=!0,this.results=null;try{const t=await Shopware.Service("falaraApiService").runAudit(this.salesChannelId);this.results=t.data||{}}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:this.$t("falara-translation-manager.general.error")})}finally{this.isScanning=!1}}},coveragePercent(a){if(!a.total||a.total===0)return 100;const t=a.total-(a.missing||0);return Math.round(t/a.total*100)}}});const{Component:_}=Shopware;_.register("falara-settings",{template:`
        <div>
            <falara-nav-tabs />

            <mt-loader v-if="isLoading" />

            <div v-else>
                <!-- Sub-tab bar -->
                <div :style="subTabBarStyle">
                    <button
                        v-for="tab in subTabs"
                        :key="tab.key"
                        :style="activeTab === tab.key ? activeSubTabStyle : subTabStyle"
                        @click="activeTab = tab.key"
                        @mouseenter="onSubTabHover($event, tab.key)"
                        @mouseleave="onSubTabLeave($event, tab.key)"
                    >
                        {{ tab.label }}
                    </button>
                </div>

                <!-- CONNECTION TAB -->
                <div v-show="activeTab === 'connection'">

                    <!-- NOT connected -->
                    <div v-if="!isConnected" :style="cardStyle">
                        <h2 :style="cardTitleStyle">Connect to Falara</h2>

                        <div :style="fieldWrapStyle">
                            <mt-text-field
                                label="API Key"
                                placeholder="Enter your Falara API key"
                                v-model="connectForm.apiKey"
                                type="password"
                            />
                        </div>

                        <div :style="fieldWrapStyle">
                            <mt-button
                                variant="primary"
                                :disabled="!connectForm.apiKey || isConnecting"
                                @click="connect"
                            >
                                {{ isConnecting ? 'Connecting…' : 'Connect' }}
                            </mt-button>
                        </div>

                        <p :style="linkTextStyle">
                            Don't have an account?
                            <a href="https://app.falara.io" target="_blank" :style="linkAStyle">Visit app.falara.io</a>
                        </p>
                    </div>

                    <!-- CONNECTED -->
                    <div v-else :style="cardStyle">
                        <div :style="statusRowStyle">
                            <span :style="statusDotStyle"></span>
                            <span :style="connectedLabelStyle">Connected</span>
                        </div>

                        <div :style="metaBlockStyle">
                            <div v-if="connectionData.accountName" :style="metaLineStyle">
                                <span :style="metaKeyStyle">Name:</span>
                                <span :style="metaValStyle">{{ connectionData.accountName }}</span>
                            </div>
                            <div v-if="connectionData.accountId" :style="metaLineStyle">
                                <span :style="metaKeyStyle">Account ID:</span>
                                <span :style="metaValStyle">{{ connectionData.accountId }}</span>
                            </div>
                            <div v-if="connectionData.plan" :style="metaLineStyle">
                                <span :style="metaKeyStyle">Plan:</span>
                                <span :style="metaValStyle">{{ connectionData.plan }}</span>
                            </div>
                            <div v-if="connectionData.connectedAt" :style="metaLineStyle">
                                <span :style="metaKeyStyle">Connected since:</span>
                                <span :style="metaValStyle">{{ formatDate(connectionData.connectedAt) }}</span>
                            </div>
                        </div>

                        <div v-if="!showDisconnectConfirm" :style="{ marginTop: '16px' }">
                            <mt-button
                                variant="danger"
                                size="small"
                                :disabled="isDisconnecting"
                                @click="showDisconnectConfirm = true"
                            >
                                {{ isDisconnecting ? 'Disconnecting…' : 'Disconnect' }}
                            </mt-button>
                        </div>

                        <div v-else :style="confirmBoxStyle">
                            <p :style="confirmTextStyle">Are you sure? This will cancel all pending jobs.</p>
                            <div :style="confirmBtnRowStyle">
                                <mt-button variant="danger" size="small" @click="disconnect">Yes</mt-button>
                                <mt-button variant="ghost" size="small" @click="showDisconnectConfirm = false">No</mt-button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- CUSTOM FIELDS TAB -->
                <div v-show="activeTab === 'customFields'">
                    <div :style="cardStyle">
                        <h2 :style="cardTitleStyle">Custom Fields</h2>
                        <p :style="descStyle">Define additional custom fields to include in translations.</p>

                        <div :style="fieldWrapStyle">
                            <mt-text-field
                                label="Field Name"
                                v-model="newFieldName"
                            />
                        </div>
                        <div :style="{ marginBottom: '20px' }">
                            <mt-button variant="primary" @click="addCustomField" :disabled="!newFieldName">
                                Add Field
                            </mt-button>
                        </div>

                        <p v-if="customFields.length === 0" :style="emptyTextStyle">No custom fields added yet.</p>
                        <ul v-else :style="fieldListStyle">
                            <li
                                v-for="(field, idx) in customFields"
                                :key="idx"
                                :style="fieldItemStyle"
                            >
                                <span>{{ field }}</span>
                                <mt-button variant="ghost" size="small" @click="removeCustomField(idx)">
                                    Remove
                                </mt-button>
                            </li>
                        </ul>

                        <mt-button variant="primary" @click="saveCustomFields" :disabled="isSaving">
                            {{ isSaving ? 'Saving…' : 'Save' }}
                        </mt-button>
                    </div>
                </div>

                <!-- DEFAULTS TAB -->
                <div v-show="activeTab === 'defaults'">
                    <div :style="cardStyle">
                        <h2 :style="cardTitleStyle">Translation Defaults</h2>

                        <div :style="fieldWrapStyle">
                            <mt-text-field
                                label="Source Language"
                                v-model="defaults.sourceLanguage"
                            />
                        </div>

                        <div :style="fieldWrapStyle">
                            <mt-text-field
                                label="Domain"
                                v-model="defaults.domain"
                            />
                        </div>

                        <div :style="fieldWrapStyle">
                            <mt-text-field
                                label="Tone"
                                v-model="defaults.tone"
                            />
                        </div>

                        <div :style="fieldWrapStyle">
                            <mt-select
                                label="Quality"
                                v-model="defaults.quality"
                                :options="qualityOptions"
                            />
                        </div>

                        <div :style="fieldWrapStyle">
                            <mt-select
                                label="Provider"
                                v-model="defaults.provider"
                                :options="providerOptions"
                            />
                        </div>

                        <div :style="fieldWrapStyle">
                            <mt-textarea
                                label="Instructions"
                                v-model="defaults.instructions"
                            />
                        </div>

                        <mt-button variant="primary" @click="saveDefaults" :disabled="isSaving">
                            {{ isSaving ? 'Saving…' : 'Save Defaults' }}
                        </mt-button>
                    </div>
                </div>
            </div>
        </div>
    `,data(){return{isLoading:!0,isSaving:!1,isConnecting:!1,isDisconnecting:!1,activeTab:"connection",isConnected:!1,connectionData:{},showDisconnectConfirm:!1,connectForm:{apiKey:""},customFields:[],newFieldName:"",defaults:{sourceLanguage:"",domain:"",tone:"",quality:"standard",provider:"",instructions:""},salesChannelId:null}},computed:{subTabs(){return[{key:"connection",label:"Connection"},{key:"customFields",label:"Custom Fields"},{key:"defaults",label:"Defaults"}]},qualityOptions(){return[{value:"draft",label:"Draft"},{value:"standard",label:"Standard"},{value:"premium",label:"Premium"}]},providerOptions(){return[{value:"deepl",label:"DeepL"},{value:"claude",label:"Claude"},{value:"gemini",label:"Gemini"},{value:"chatgpt",label:"ChatGPT"}]},subTabBarStyle(){return{display:"flex",gap:"0",borderBottom:"1px solid #e5e7eb",marginBottom:"24px",background:"#fff"}},subTabStyle(){return{background:"none",border:"none",borderBottom:"3px solid transparent",padding:"12px 20px",cursor:"pointer",fontSize:"14px",fontWeight:"500",color:"#6b7280",whiteSpace:"nowrap",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif",transition:"all 0.15s ease"}},activeSubTabStyle(){return{...this.subTabStyle,color:"#1a73e8",borderBottomColor:"#1a73e8",fontWeight:"600"}},cardStyle(){return{background:"#fff",borderRadius:"10px",padding:"24px",border:"1px solid #e5e7eb",maxWidth:"560px"}},cardTitleStyle(){return{fontSize:"18px",fontWeight:"700",color:"#1a1a2e",margin:"0 0 20px 0",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},fieldWrapStyle(){return{marginBottom:"16px"}},linkTextStyle(){return{marginTop:"16px",fontSize:"13px",color:"#6b7280"}},linkAStyle(){return{color:"#1a73e8",textDecoration:"underline"}},statusRowStyle(){return{display:"flex",alignItems:"center",marginBottom:"16px"}},statusDotStyle(){return{display:"inline-block",width:"10px",height:"10px",borderRadius:"50%",background:"#22c55e",marginRight:"8px",flexShrink:"0"}},connectedLabelStyle(){return{color:"#16a34a",fontWeight:"600",fontSize:"15px"}},metaBlockStyle(){return{display:"flex",flexDirection:"column",gap:"8px"}},metaLineStyle(){return{display:"flex",gap:"8px",fontSize:"14px"}},metaKeyStyle(){return{color:"#6b7280",minWidth:"130px"}},metaValStyle(){return{color:"#1a1a2e",fontWeight:"500"}},confirmBoxStyle(){return{marginTop:"16px",padding:"16px",background:"#fef2f2",borderRadius:"8px",border:"1px solid #fecaca"}},confirmTextStyle(){return{margin:"0 0 12px 0",fontSize:"14px",color:"#dc2626",fontWeight:"500"}},confirmBtnRowStyle(){return{display:"flex",gap:"8px"}},descStyle(){return{fontSize:"14px",color:"#6b7280",marginBottom:"20px",marginTop:"-12px"}},emptyTextStyle(){return{fontSize:"14px",color:"#9ca3af",fontStyle:"italic",marginBottom:"16px"}},fieldListStyle(){return{listStyle:"none",padding:"0",margin:"0 0 20px 0"}},fieldItemStyle(){return{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f3f4f6",fontSize:"14px",color:"#374151"}}},created(){this.initSalesChannel()},methods:{onSubTabHover(a,t){this.activeTab!==t&&(a.target.style.color="#1a73e8",a.target.style.background="#f0f4ff")},onSubTabLeave(a,t){this.activeTab!==t&&(a.target.style.color="#6b7280",a.target.style.background="none")},async initSalesChannel(){const t=await Shopware.Service("repositoryFactory").create("sales_channel").search(new Shopware.Data.Criteria,Shopware.Context.api);t.length>0?(this.salesChannelId=t.first().id,await this.loadAll()):this.isLoading=!1},async loadAll(){this.isLoading=!0;try{await Promise.all([this.loadConnection(),this.loadDefaults(),this.loadCustomFields()])}finally{this.isLoading=!1}},async loadConnection(){try{const t=await Shopware.Service("falaraApiService").getConnection(this.salesChannelId),e=t.data&&t.data.connection;this.isConnected=!!(e&&!e.disconnectedAt),this.isConnected?this.connectionData={accountId:e.falaraAccountId,accountName:e.accountName||null,plan:e.plan||null,connectedAt:e.connectedAt||null}:this.connectionData={}}catch{this.isConnected=!1,this.connectionData={}}},async loadDefaults(){try{const t=await Shopware.Service("falaraApiService").getDefaults(this.salesChannelId);t.data&&(this.defaults={...this.defaults,...t.data})}catch{}},async loadCustomFields(){try{const t=await Shopware.Service("falaraApiService").getCustomFields(this.salesChannelId);this.customFields=t.data&&t.data.fields?t.data.fields:[]}catch{this.customFields=[]}},async connect(){this.isConnecting=!0;try{await Shopware.Service("falaraApiService").connect(this.salesChannelId,this.connectForm.apiKey),this.connectForm.apiKey="",await this.loadConnection(),Shopware.State.dispatch("notification/createNotification",{type:"success",message:"Connected successfully."})}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:"Connection failed. Please check your API key."})}finally{this.isConnecting=!1}},async disconnect(){this.showDisconnectConfirm=!1,this.isDisconnecting=!0;try{await Shopware.Service("falaraApiService").disconnect(this.salesChannelId),await this.loadConnection(),Shopware.State.dispatch("notification/createNotification",{type:"success",message:"Disconnected successfully."})}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:"Disconnect failed. Please try again."})}finally{this.isDisconnecting=!1}},addCustomField(){this.newFieldName&&(this.customFields.includes(this.newFieldName)||this.customFields.push(this.newFieldName),this.newFieldName="")},removeCustomField(a){this.customFields.splice(a,1)},async saveCustomFields(){this.isSaving=!0;try{await Shopware.Service("falaraApiService").saveCustomFields(this.salesChannelId,this.customFields),Shopware.State.dispatch("notification/createNotification",{type:"success",message:"Custom fields saved."})}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:"Failed to save custom fields."})}finally{this.isSaving=!1}},async saveDefaults(){this.isSaving=!0;try{await Shopware.Service("falaraApiService").saveDefaults(this.salesChannelId,this.defaults),Shopware.State.dispatch("notification/createNotification",{type:"success",message:"Defaults saved."})}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:"Failed to save defaults."})}finally{this.isSaving=!1}},formatDate(a){if(!a)return"";try{return new Date(a).toLocaleDateString(void 0,{year:"numeric",month:"long",day:"numeric"})}catch{return a}}}});const{Component:k}=Shopware;k.register("falara-status-badge",{template:`
        <div class="falara-status-badge" :class="badgeClass" :title="tooltipText">
            <span class="falara-status-badge__dot"></span>
            <span class="falara-status-badge__label">{{ labelText }}</span>
        </div>
    `,props:{status:{type:String,required:!0}},computed:{badgeClass(){return{pending:"falara-status-badge--yellow",queued:"falara-status-badge--yellow",processing:"falara-status-badge--blue",writing_back:"falara-status-badge--blue",completed:"falara-status-badge--green",written_back:"falara-status-badge--green",needs_review:"falara-status-badge--green",failed:"falara-status-badge--red",dead:"falara-status-badge--red",writeback_failed:"falara-status-badge--red"}[this.status]||"falara-status-badge--grey"},labelText(){const a=`falara-translation-manager.status.${this.status}`;return this.$t(a)},tooltipText(){const a=`falara-translation-manager.status.${this.status}_tooltip`;return this.$t(a)}}});const{Component:T}=Shopware;T.register("falara-quota-widget",{template:`
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
    `,props:{usage:{type:Object,required:!0,default:()=>({plan:"",used:0,limit:0})}},computed:{progressValue(){return!this.usage.limit||this.usage.limit===0?0:Math.min(Math.round(this.usage.used/this.usage.limit*100),100)},isWarning(){return this.progressValue>=80&&this.progressValue<100},isExceeded(){return this.progressValue>=100},remaining(){const a=(this.usage.limit||0)-(this.usage.used||0);return Math.max(a,0)}}});const{Component:A}=Shopware;A.register("falara-translate-modal",{template:`
        <div :style="containerStyle">
            <div :style="summaryStyle">
                <span>{{ items.length }} {{ items.length === 1 ? 'item' : 'items' }} selected</span>
            </div>

            <div :style="sectionStyle">
                <label :style="labelStyle">{{ $t('falara-translation-manager.modal.targetLanguages') }}</label>
                <div :style="langGridStyle">
                    <div
                        v-for="lang in availableLanguages"
                        :key="lang.id"
                        :style="langItemStyle"
                    >
                        <input
                            type="checkbox"
                            :id="'lang-' + lang.id"
                            :value="lang.id"
                            v-model="selectedLanguages"
                            :style="checkboxStyle"
                        />
                        <label :for="'lang-' + lang.id" :style="checkboxLabelStyle">{{ lang.name }}</label>
                    </div>
                </div>
            </div>

            <div :style="sectionStyle">
                <label :style="labelStyle">{{ $t('falara-translation-manager.modal.glossary') }}</label>
                <select v-model="selectedGlossary" :style="selectStyle">
                    <option :value="null">{{ $t('falara-translation-manager.modal.noGlossary') }}</option>
                    <option v-for="g in glossaries" :key="g.id" :value="g.id">{{ g.name }}</option>
                </select>
            </div>

            <div :style="sectionStyle">
                <button :style="toggleStyle" @click="showAdvanced = !showAdvanced">
                    {{ $t('falara-translation-manager.modal.advancedOptions') }}
                    <span>{{ showAdvanced ? ' ▲' : ' ▼' }}</span>
                </button>

                <div v-if="showAdvanced" :style="advancedContentStyle">
                    <div :style="fieldGroupStyle">
                        <label :style="labelStyle">{{ $t('falara-translation-manager.modal.domain') }}</label>
                        <mt-text-field v-model="form.domain" />
                    </div>

                    <div :style="fieldGroupStyle">
                        <label :style="labelStyle">{{ $t('falara-translation-manager.modal.tone') }}</label>
                        <mt-text-field v-model="form.tone" />
                    </div>

                    <div :style="fieldGroupStyle">
                        <label :style="labelStyle">{{ $t('falara-translation-manager.modal.quality') }}</label>
                        <select v-model="form.quality" :style="selectStyle">
                            <option value="draft">Draft</option>
                            <option value="standard">Standard</option>
                            <option value="premium">Premium</option>
                        </select>
                    </div>

                    <div :style="fieldGroupStyle">
                        <label :style="labelStyle">{{ $t('falara-translation-manager.modal.instructions') }}</label>
                        <mt-textarea v-model="form.instructions" />
                    </div>
                </div>
            </div>

            <div :style="actionsStyle">
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
    `,emits:["translate","cancel"],props:{items:{type:Array,required:!0,default:()=>[]},salesChannelId:{type:String,required:!0},defaults:{type:Object,default:()=>({})}},data(){return{selectedLanguages:[],selectedGlossary:null,showAdvanced:!1,availableLanguages:[],glossaries:[],form:{domain:"",tone:"",quality:"standard",instructions:""}}},computed:{containerStyle(){return{background:"#ffffff",borderRadius:"10px",padding:"24px",boxShadow:"0 4px 24px rgba(0,0,0,0.10)",fontFamily:"inherit"}},summaryStyle(){return{display:"inline-block",background:"#f3f4f6",borderRadius:"999px",padding:"4px 16px",fontSize:"13px",color:"#6b7280",marginBottom:"20px",fontWeight:"500"}},sectionStyle(){return{marginBottom:"20px"}},langGridStyle(){return{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"8px",marginTop:"8px"}},langItemStyle(){return{display:"flex",alignItems:"center",gap:"6px"}},checkboxStyle(){return{cursor:"pointer",width:"15px",height:"15px",flexShrink:"0"}},checkboxLabelStyle(){return{fontSize:"13px",color:"#374151",cursor:"pointer"}},selectStyle(){return{width:"100%",padding:"8px 12px",border:"1px solid #d1d5db",borderRadius:"6px",fontSize:"14px",background:"#fff",color:"#111827",outline:"none",cursor:"pointer",height:"40px"}},labelStyle(){return{display:"block",fontSize:"13px",fontWeight:"600",color:"#374151",marginBottom:"4px"}},toggleStyle(){return{background:"none",border:"none",padding:"0",fontSize:"13px",fontWeight:"600",color:"#6366f1",cursor:"pointer",textDecoration:"underline"}},advancedContentStyle(){return{marginTop:"16px",display:"flex",flexDirection:"column",gap:"16px"}},fieldGroupStyle(){return{display:"flex",flexDirection:"column"}},actionsStyle(){return{display:"flex",justifyContent:"flex-end",gap:"12px",borderTop:"1px solid #e5e7eb",paddingTop:"20px",marginTop:"4px"}}},created(){this.loadLanguages(),this.loadGlossaries(),this.applyDefaults()},methods:{applyDefaults(){this.defaults&&(this.form.domain=this.defaults.domain||"",this.form.tone=this.defaults.tone||"",this.form.quality=this.defaults.quality||"standard",this.form.instructions=this.defaults.instructions||"",this.defaults.targetLanguages&&(this.selectedLanguages=[...this.defaults.targetLanguages]),this.defaults.glossaryId&&(this.selectedGlossary=this.defaults.glossaryId))},loadLanguages(){const a=Shopware.Service("repositoryFactory").create("language"),t=new Shopware.Data.Criteria;t.addAssociation("locale"),a.search(t,Shopware.Context.api).then(e=>{this.availableLanguages=e.map(n=>{var s;return{id:n.id,name:n.name||((s=n.locale)==null?void 0:s.name)||n.id}})}).catch(()=>{this.availableLanguages=[]})},loadGlossaries(){Shopware.Service("falaraApiService").getGlossaries(this.salesChannelId).then(t=>{const e=t.data;this.glossaries=Array.isArray(e)?e:(e==null?void 0:e.glossaries)||(e==null?void 0:e.items)||[]}).catch(()=>{this.glossaries=[]})},toggleLanguage(a){const t=this.selectedLanguages.indexOf(a);t>-1?this.selectedLanguages.splice(t,1):this.selectedLanguages.push(a)},onTranslate(){this.selectedLanguages.length!==0&&this.$emit("translate",{items:this.items,salesChannelId:this.salesChannelId,targetLanguages:this.selectedLanguages,glossaryId:this.selectedGlossary,...this.form})}}});const{Component:I}=Shopware;I.register("falara-nav-tabs",{template:`
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
    `,computed:{containerStyle(){return{background:"#fff",borderBottom:"1px solid #d1d5db",margin:"-20px -20px 24px -20px",padding:"0",borderRadius:"8px 8px 0 0"}},headerStyle(){return{padding:"24px 32px 0 32px"}},titleStyle(){return{fontSize:"24px",fontWeight:"700",color:"#1a1a2e",margin:"0 0 16px 0",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},barStyle(){return{display:"flex",gap:"0",padding:"0 32px",borderTop:"1px solid #e5e7eb"}},tabStyle(){return{background:"none",border:"none",borderBottom:"3px solid transparent",padding:"14px 20px",cursor:"pointer",fontSize:"14px",fontWeight:"500",color:"#6b7280",whiteSpace:"nowrap",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif",transition:"all 0.15s ease"}},activeTabStyle(){return{...this.tabStyle,color:"#1a73e8",borderBottomColor:"#1a73e8",fontWeight:"600"}},tabs(){return[{route:"falara.translation.manager.dashboard",label:"falara-translation-manager.nav.dashboard"},{route:"falara.translation.manager.content",label:"falara-translation-manager.nav.content"},{route:"falara.translation.manager.jobs",label:"falara-translation-manager.nav.jobs"},{route:"falara.translation.manager.audit",label:"falara-translation-manager.nav.audit"},{route:"falara.translation.manager.settings",label:"falara-translation-manager.nav.settings"}]}},methods:{isActive(a){const t=this.$route.name;return t?t===a||a==="falara.translation.manager.jobs"&&t==="falara.translation.manager.job-detail":!1},navigate(a){this.isActive(a)||this.$router.push({name:a})}}});const{Module:D}=Shopware;D.register("falara-translation-manager",{type:"plugin",name:"falara-translation-manager.general.title",title:"falara-translation-manager.general.title",description:"falara-translation-manager.general.description",color:"#1a73e8",icon:"regular-language",snippets:{"de-DE":()=>g(()=>import("./de-DE-CTLn2U6y.js"),[]),"en-GB":()=>g(()=>import("./en-GB-Cpj3ozAp.js"),[])},routes:{dashboard:{component:"falara-dashboard",path:"dashboard"},content:{component:"falara-content",path:"content/:type?"},jobs:{component:"falara-jobs",path:"jobs"},"job-detail":{component:"falara-job-detail",path:"jobs/:id"},audit:{component:"falara-audit",path:"audit"},settings:{component:"falara-settings",path:"settings"}},navigation:[{label:"falara-translation-manager.general.title",color:"#1a73e8",icon:"regular-language",path:"falara.translation.manager.dashboard",parent:"sw-settings",position:100}]});
//# sourceMappingURL=falara-translation-manager-C8fGM2ri.js.map
