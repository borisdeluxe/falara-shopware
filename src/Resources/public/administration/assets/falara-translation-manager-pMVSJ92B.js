const{Application:u}=Shopware;class b{constructor(t,a){this.httpClient=t,this.loginService=a,this.basePath="_action/falara"}getHeaders(){return{Authorization:`Bearer ${this.loginService.getToken()}`,"Content-Type":"application/json"}}connect(t,a){return this.httpClient.post(`${this.basePath}/connect`,{salesChannelId:t,apiKey:a},{headers:this.getHeaders()})}disconnect(t){return this.httpClient.post(`${this.basePath}/disconnect`,{salesChannelId:t},{headers:this.getHeaders()})}getConnection(t){return this.httpClient.get(`${this.basePath}/connection/${t}`,{headers:this.getHeaders()})}getUsage(t){return this.httpClient.get(`${this.basePath}/settings/usage/${t}`,{headers:this.getHeaders()})}getContentItems(t,a,s={}){return this.httpClient.get(`${this.basePath}/content/${t}/${a}`,{params:s,headers:this.getHeaders()})}getContentTypes(){return this.httpClient.get(`${this.basePath}/content-types`,{headers:this.getHeaders()})}getSnippetSubgroups(t,a){return this.httpClient.get(`${this.basePath}/snippet-subgroups/${t}`,{params:{group:a},headers:this.getHeaders()})}getSnippetGroups(t){return this.httpClient.get(`${this.basePath}/snippet-groups/${t}`,{headers:this.getHeaders()})}translate(t){return this.httpClient.post(`${this.basePath}/translate`,t,{headers:this.getHeaders()})}getJobs(t,a={}){return this.httpClient.get(`${this.basePath}/jobs/${t}`,{params:a,headers:this.getHeaders()})}getJob(t){return this.httpClient.get(`${this.basePath}/jobs/detail/${t}`,{headers:this.getHeaders()})}retryWriteBack(t){return this.httpClient.post(`${this.basePath}/jobs/${t}/retry`,{},{headers:this.getHeaders()})}archiveJob(t){return this.httpClient.patch(`${this.basePath}/jobs/${t}/archive`,{},{headers:this.getHeaders()})}runAudit(t){return this.httpClient.get(`${this.basePath}/audit/${t}`,{headers:this.getHeaders()})}getDefaults(t){return this.httpClient.get(`${this.basePath}/settings/defaults/${t}`,{headers:this.getHeaders()})}saveDefaults(t,a){return this.httpClient.post(`${this.basePath}/settings/defaults/${t}`,a,{headers:this.getHeaders()})}getGlossaries(t){return this.httpClient.get(`${this.basePath}/settings/glossaries/${t}`,{headers:this.getHeaders()})}getCustomFields(t){return this.httpClient.get(`${this.basePath}/settings/custom-fields/${t}`,{headers:this.getHeaders()})}addCustomField(t,a,s){return this.httpClient.post(`${this.basePath}/settings/custom-fields/${t}`,{fieldSetName:a,fieldName:s},{headers:this.getHeaders()})}deleteCustomField(t){return this.httpClient.delete(`${this.basePath}/settings/custom-fields/entry/${t}`,{headers:this.getHeaders()})}getAvailableCustomFields(t){return this.httpClient.get(`${this.basePath}/settings/available-custom-fields/${t}`,{headers:this.getHeaders()})}}u.addServiceProvider("falaraApiService",e=>{const t=u.getContainer("init");return new b(t.httpClient,e.loginService)});const v="modulepreload",S=function(e){return window.__sw__.assetPath+"/bundles/falaratranslationmanager/administration/"+e},g={},h=function(t,a,s){let r=Promise.resolve();if(a&&a.length>0){let i=function(l){return Promise.all(l.map(p=>Promise.resolve(p).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};document.getElementsByTagName("link");const n=document.querySelector("meta[property=csp-nonce]"),o=(n==null?void 0:n.nonce)||(n==null?void 0:n.getAttribute("nonce"));r=i(a.map(l=>{if(l=S(l),l in g)return;g[l]=!0;const p=l.endsWith(".css"),f=p?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${f}`))return;const c=document.createElement("link");if(c.rel=p?"stylesheet":v,p||(c.as="script"),c.crossOrigin="",c.href=l,o&&c.setAttribute("nonce",o),document.head.appendChild(c),p)return new Promise((m,y)=>{c.addEventListener("load",m),c.addEventListener("error",()=>y(new Error(`Unable to preload CSS for ${l}`)))})}))}function d(i){const n=new Event("vite:preloadError",{cancelable:!0});if(n.payload=i,window.dispatchEvent(n),!n.defaultPrevented)throw i}return r.then(i=>{for(const n of i||[])n.status==="rejected"&&d(n.reason);return t().catch(d)})},{Component:x}=Shopware;x.register("falara-dashboard",{template:`
        <div class="falara-dashboard">
            <falara-nav-tabs />

            <div :style="{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }">
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
        </div>
    `,data(){return{isLoading:!0,isConnected:!1,usage:null,recentJobs:[],stats:{total:0,completed:0,failed:0,pending:0},salesChannelId:null}},computed:{cardStyle(){return{background:"#ffffff",borderRadius:"10px",padding:"24px",boxShadow:"0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.05)",marginBottom:"24px",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},statCardStyle(){return{background:"#ffffff",borderRadius:"8px",padding:"20px",border:"1px solid #e5e7eb",display:"flex",flexDirection:"column",gap:"6px",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},statValueStyle(){return{fontSize:"32px",fontWeight:"700",color:"#1a1a2e",lineHeight:"1"}},statLabelStyle(){return{fontSize:"13px",color:"#6b7280",fontWeight:"500"}},tableStyle(){return{width:"100%",borderCollapse:"collapse",fontSize:"14px"}},thStyle(){return{textAlign:"left",padding:"10px 14px",fontSize:"11px",fontWeight:"600",color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em",background:"#f3f4f6",borderBottom:"1px solid #e5e7eb"}},tdStyle(){return{padding:"12px 14px",color:"#374151",borderBottom:"1px solid #f3f4f6",verticalAlign:"middle"}},tdRowEvenStyle(){return{background:"#ffffff"}},tdRowOddStyle(){return{background:"#f9fafb"}}},created(){this.loadDashboard()},methods:{async loadDashboard(){var e,t,a;this.isLoading=!0;try{const r=await Shopware.Service("repositoryFactory").create("sales_channel").search(new Shopware.Data.Criteria,Shopware.Context.api);if(r.length===0){this.isConnected=!1;return}this.salesChannelId=r.first().id;const d=Shopware.Service("falaraApiService");try{const i=await d.getConnection(this.salesChannelId);this.isConnected=!!(i.data&&i.data.connection&&!i.data.connection.disconnectedAt)}catch{this.isConnected=!1}if(this.isConnected){try{const i=await d.getUsage(this.salesChannelId);this.usage=((e=i.data)==null?void 0:e.usage)||i.data||{}}catch{this.usage={}}try{const i=await d.getJobs(this.salesChannelId,{limit:10}),n=((t=i.data)==null?void 0:t.jobs)||((a=i.data)==null?void 0:a.items)||[];this.recentJobs=n.slice(0,5),this.stats.total=n.length,this.stats.completed=n.filter(o=>["completed","written_back"].includes(o.status)).length,this.stats.failed=n.filter(o=>["failed","dead","writeback_failed"].includes(o.status)).length,this.stats.pending=n.filter(o=>["pending","queued","processing"].includes(o.status)).length}catch{this.recentJobs=[]}}}finally{this.isLoading=!1}},formatDate(e){return e?new Date(e).toLocaleString():"-"},goToSettings(){this.$router.push({name:"falara.translation.manager.settings"})},goToJobs(){this.$router.push({name:"falara.translation.manager.jobs"})},goToJob(e){this.$router.push({name:"falara.translation.manager.job-detail",params:{id:e}})}}});const{Component:w}=Shopware;w.register("falara-content",{template:`
        <div class="falara-content">
            <falara-nav-tabs />

            <div :style="{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }">
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

                    <!-- Snippet Group Filter -->
                    <!-- Snippet Group / Subgroup Filters -->
                    <div v-if="activeTab === 'snippet' && snippetGroups.length > 0" :style="{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }">
                        <div>
                            <label :style="{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }">
                                Snippet Group
                            </label>
                            <select
                                :value="selectedSnippetGroup"
                                @change="onSnippetGroupChange($event.target.value)"
                                :style="selectStyle"
                            >
                                <option value="">All groups ({{ snippetGroupTotal }})</option>
                                <option
                                    v-for="group in snippetGroups"
                                    :key="group.name"
                                    :value="group.name"
                                >
                                    {{ group.name }} ({{ group.snippetCount }})
                                </option>
                            </select>
                        </div>
                        <div v-if="selectedSnippetGroup && snippetSubgroups.length > 0">
                            <label :style="{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }">
                                Key Prefix
                            </label>
                            <select
                                :value="selectedSnippetSubgroup"
                                @change="onSnippetSubgroupChange($event.target.value)"
                                :style="selectStyle"
                            >
                                <option value="">All prefixes</option>
                                <option
                                    v-for="sub in snippetSubgroups"
                                    :key="sub.name"
                                    :value="sub.name"
                                >
                                    {{ sub.name }} ({{ sub.snippetCount }})
                                </option>
                            </select>
                        </div>
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
        </div>
    `,data(){return{isLoading:!1,activeTab:"product",hoverTab:null,searchTerm:"",items:[],selectedItems:[],currentPage:1,totalPages:1,pageSize:25,totalItems:0,showTranslateModal:!1,salesChannelId:null,translationDefaults:{},snippetGroups:[],selectedSnippetGroup:"",snippetSubgroups:[],selectedSnippetSubgroup:""}},computed:{tabItems(){return[{name:"product",label:this.$t("falara-translation-manager.content.product")},{name:"category",label:this.$t("falara-translation-manager.content.category")},{name:"cms_page",label:this.$t("falara-translation-manager.content.cms_page")},{name:"snippet",label:this.$t("falara-translation-manager.content.snippet")}]},allSelected(){return this.items.length>0&&this.items.every(e=>this.selectedItems.includes(e.id))},selectedItemObjects(){return this.items.filter(e=>this.selectedItems.includes(e.id))},snippetGroupTotal(){return this.snippetGroups.reduce((e,t)=>e+t.snippetCount,0)},selectStyle(){return{width:"100%",maxWidth:"400px",padding:"8px 12px",fontSize:"14px",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif",border:"1px solid #d1d5db",borderRadius:"6px",background:"#ffffff",color:"#374151",cursor:"pointer",outline:"none"}},tabBarStyle(){return{display:"flex",gap:"4px",marginBottom:"20px",background:"#f3f4f6",borderRadius:"8px",padding:"4px",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},tabBtnStyle(){return{background:"none",border:"none",borderRadius:"6px",padding:"8px 18px",cursor:"pointer",fontSize:"14px",fontWeight:"500",color:"#6b7280",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif",transition:"all 0.15s ease"}},activeTabBtnStyle(){return{...this.tabBtnStyle,background:"#ffffff",color:"#1a73e8",fontWeight:"600",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}},tableWrapStyle(){return{background:"#ffffff",borderRadius:"8px",border:"1px solid #e5e7eb",overflow:"hidden"}},tableStyle(){return{width:"100%",borderCollapse:"collapse",fontSize:"14px",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},thStyle(){return{textAlign:"left",padding:"10px 16px",fontSize:"11px",fontWeight:"600",color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em",background:"#f9fafb",borderBottom:"2px solid #e5e7eb"}},tdStyle(){return{padding:"12px 16px",color:"#374151",borderBottom:"1px solid #f3f4f6",verticalAlign:"middle"}},tdRowEvenStyle(){return{background:"#ffffff"}},tdRowOddStyle(){return{background:"#f9fafb"}},modalOverlayStyle(){return{position:"fixed",top:"0",left:"0",width:"100%",height:"100%",background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:"1000"}},modalStyle(){return{width:"600px",maxWidth:"90vw",maxHeight:"90vh",overflow:"auto"}}},created(){this.activeTab=this.$route.params.type||"product",this.initSalesChannel()},methods:{async initSalesChannel(){const t=await Shopware.Service("repositoryFactory").create("sales_channel").search(new Shopware.Data.Criteria,Shopware.Context.api);t.length>0&&(this.salesChannelId=t.first().id,await this.loadDefaults(),this.activeTab==="snippet"&&await this.loadSnippetGroups(),await this.loadItems())},async loadDefaults(){if(this.salesChannelId)try{const t=await Shopware.Service("falaraApiService").getDefaults(this.salesChannelId);this.translationDefaults=t.data||{}}catch{this.translationDefaults={}}},async loadSnippetGroups(){var e;if(this.salesChannelId)try{const a=await Shopware.Service("falaraApiService").getSnippetGroups(this.salesChannelId);this.snippetGroups=((e=a.data)==null?void 0:e.groups)||[]}catch{this.snippetGroups=[]}},async loadSnippetSubgroups(){var e;if(!(!this.salesChannelId||!this.selectedSnippetGroup))try{const a=await Shopware.Service("falaraApiService").getSnippetSubgroups(this.salesChannelId,this.selectedSnippetGroup);this.snippetSubgroups=((e=a.data)==null?void 0:e.subgroups)||[]}catch{this.snippetSubgroups=[]}},async loadItems(){var e,t;if(this.salesChannelId){this.isLoading=!0;try{const a=Shopware.Service("falaraApiService"),s={page:this.currentPage,limit:this.pageSize,search:this.searchTerm};this.activeTab==="snippet"&&this.selectedSnippetGroup&&(s.group=this.selectedSnippetGroup,this.selectedSnippetSubgroup&&(s.subgroup=this.selectedSnippetSubgroup));const r=await a.getContentItems(this.salesChannelId,this.activeTab,s);this.items=((e=r.data)==null?void 0:e.items)||[],this.totalItems=((t=r.data)==null?void 0:t.total)||0,this.totalPages=Math.ceil(this.totalItems/this.pageSize)||1}catch{this.items=[]}finally{this.isLoading=!1}}},onTabChange(e){this.activeTab!==e&&(this.activeTab=e,this.selectedItems=[],this.currentPage=1,this.selectedSnippetGroup="",this.snippetGroups=[],this.selectedSnippetSubgroup="",this.snippetSubgroups=[],this.$router.replace({params:{type:this.activeTab}}),e==="snippet"?this.loadSnippetGroups().then(()=>this.loadItems()):this.loadItems())},onSnippetGroupChange(e){this.selectedSnippetGroup=e,this.selectedSnippetSubgroup="",this.snippetSubgroups=[],this.currentPage=1,this.selectedItems=[],e?this.loadSnippetSubgroups().then(()=>this.loadItems()):this.loadItems()},onSnippetSubgroupChange(e){this.selectedSnippetSubgroup=e,this.currentPage=1,this.selectedItems=[],this.loadItems()},onSearch(){this.currentPage=1,this.loadItems()},toggleItem(e){const t=this.selectedItems.indexOf(e);t>-1?this.selectedItems.splice(t,1):this.selectedItems.push(e)},toggleAll(){this.allSelected?this.selectedItems=[]:this.selectedItems=this.items.map(e=>e.id)},openTranslateModal(){this.selectedItems.length!==0&&(this.showTranslateModal=!0)},async onTranslate(e){this.showTranslateModal=!1,this.isLoading=!0;try{const t=Shopware.Service("falaraApiService"),a={salesChannelId:this.salesChannelId,resourceType:this.activeTab,entityIds:e.items.map(s=>s.id),sourceLocale:Shopware.Context.api.systemLanguageId,targetLocales:e.targetLanguages,sourceLang:"en",options:{quality:e.quality||"standard",domain:e.domain||void 0,tone:e.tone||void 0,instructions:e.instructions||void 0,glossary_ids:e.glossaryId?[e.glossaryId]:void 0}};await t.translate(a),this.selectedItems=[],Shopware.State.dispatch("notification/createNotification",{type:"success",message:this.$t("falara-translation-manager.general.success")})}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:this.$t("falara-translation-manager.general.error")})}finally{this.isLoading=!1}},prevPage(){this.currentPage>1&&(this.currentPage--,this.loadItems())},nextPage(){this.currentPage<this.totalPages&&(this.currentPage++,this.loadItems())},formatDate(e){return e?new Date(e).toLocaleString():"-"}}});const{Component:C}=Shopware;C.register("falara-jobs",{template:`
        <div>
            <falara-nav-tabs />
            <div :style="{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }">
                <div :style="{ background: '#fff', borderRadius: '10px', padding: '24px', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }">
                    <h2 :style="{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: '#111827' }">Translation Jobs</h2>

                    <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }">
                        <label :style="{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#374151' }">
                            <input
                                type="checkbox"
                                v-model="showArchived"
                                @change="loadJobs"
                                :style="{ width: '16px', height: '16px', cursor: 'pointer' }"
                            />
                            Show Archived
                        </label>
                        <span :style="{ fontSize: '13px', color: '#9ca3af' }">Auto-refreshing every 5s</span>
                    </div>

                    <div v-if="isLoading" :style="{ textAlign: 'center', padding: '40px', color: '#6b7280' }">
                        Loading...
                    </div>

                    <div v-else-if="jobs.length === 0" :style="{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af', fontSize: '15px' }">
                        No translation jobs yet
                    </div>

                    <div v-else :style="{ overflowX: 'auto' }">
                        <table :style="{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }">
                            <thead>
                                <tr :style="{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }">
                                    <th :style="{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }">Project</th>
                                    <th :style="{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }">Type</th>
                                    <th :style="{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }">Target</th>
                                    <th :style="{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }">Items</th>
                                    <th :style="{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }">Words</th>
                                    <th :style="{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }">Status</th>
                                    <th :style="{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }">Created</th>
                                    <th :style="{ padding: '10px 14px', textAlign: 'left', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap' }">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(job, index) in jobs"
                                    :key="job.id"
                                    :style="{ background: index % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }"
                                >
                                    <td :style="{ padding: '10px 14px', color: '#374151', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }">
                                        {{ job.projectName || '-' }}
                                    </td>
                                    <td :style="{ padding: '10px 14px', color: '#374151' }">{{ job.resourceType }}</td>
                                    <td :style="{ padding: '10px 14px', color: '#374151' }">{{ job.targetLocale }}</td>
                                    <td :style="{ padding: '10px 14px', color: '#374151' }">{{ job.resourceCount }}</td>
                                    <td :style="{ padding: '10px 14px', color: '#374151' }">{{ job.wordCount }}</td>
                                    <td :style="{ padding: '10px 14px' }">
                                        <falara-status-badge :status="job.status" />
                                    </td>
                                    <td :style="{ padding: '10px 14px', color: '#374151', whiteSpace: 'nowrap' }">{{ formatDate(job.createdAt) }}</td>
                                    <td :style="{ padding: '10px 14px', display: 'flex', gap: '8px', alignItems: 'center' }">
                                        <button
                                            @click="viewJob(job.id)"
                                            :style="{ padding: '4px 12px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', color: '#374151', cursor: 'pointer' }"
                                        >
                                            View
                                        </button>
                                        <button
                                            v-if="!job.archived"
                                            @click="archiveJob(job.id)"
                                            :style="{ padding: '4px 12px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '6px', background: '#fff', color: '#6b7280', cursor: 'pointer' }"
                                        >
                                            Archive
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `,data(){return{isLoading:!1,jobs:[],showArchived:!1,salesChannelId:null,pollInterval:null}},created(){this.initSalesChannel()},beforeUnmount(){this.stopPolling()},methods:{async initSalesChannel(){const t=await Shopware.Service("repositoryFactory").create("sales_channel").search(new Shopware.Data.Criteria,Shopware.Context.api);t.length>0&&(this.salesChannelId=t.first().id,await this.loadJobs(),this.startPolling())},async loadJobs(){var e,t;if(this.salesChannelId){this.isLoading=!0;try{const a=Shopware.Service("falaraApiService"),s={archived:this.showArchived?"1":"0"},r=await a.getJobs(this.salesChannelId,s);this.jobs=((e=r.data)==null?void 0:e.jobs)||((t=r.data)==null?void 0:t.items)||[]}catch{this.jobs=[]}finally{this.isLoading=!1}}},startPolling(){this.pollInterval=setInterval(()=>{this.loadJobs()},5e3)},stopPolling(){this.pollInterval&&(clearInterval(this.pollInterval),this.pollInterval=null)},viewJob(e){this.$router.push({name:"falara.translation.manager.job-detail",params:{id:e}})},async archiveJob(e){try{await Shopware.Service("falaraApiService").archiveJob(e),await this.loadJobs()}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:this.$t("falara-translation-manager.general.error")})}},formatDate(e){return e?new Date(e).toLocaleString():"-"}}});const{Component:k}=Shopware;k.register("falara-job-detail",{template:`
        <div>
            <falara-nav-tabs />
            <div :style="{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }">

                <a
                    href="#"
                    @click.prevent="goBack"
                    :style="{ display: 'inline-block', marginBottom: '20px', color: '#6366f1', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }"
                >
                    ← Back to Jobs
                </a>

                <div v-if="isLoading" :style="{ textAlign: 'center', padding: '48px', color: '#6b7280' }">
                    Loading...
                </div>

                <div
                    v-else-if="job"
                    :style="{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '24px' }"
                >
                    <!-- Status Banner -->
                    <div
                        :style="{
                            background: statusBannerColor,
                            borderRadius: '8px',
                            padding: '16px 20px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }"
                    >
                        <span
                            :style="{
                                display: 'inline-block',
                                background: statusBadgeColor,
                                color: '#fff',
                                borderRadius: '20px',
                                padding: '4px 14px',
                                fontSize: '13px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }"
                        >{{ job.status }}</span>
                        <span :style="{ color: '#374151', fontSize: '14px' }">Job {{ job.falaraJobId }}</span>
                    </div>

                    <!-- Zombie Warning -->
                    <div
                        v-if="isZombie"
                        :style="{
                            background: '#fffbeb',
                            border: '1px solid #fcd34d',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            marginBottom: '20px',
                            color: '#92400e',
                            fontSize: '14px'
                        }"
                    >
                        ⚠ This job has been in <strong>{{ job.status }}</strong> for more than 15 minutes and may be stuck.
                    </div>

                    <!-- Info Grid -->
                    <div
                        :style="{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '16px',
                            marginBottom: '24px'
                        }"
                    >
                        <div :style="{ background: '#f9fafb', borderRadius: '8px', padding: '14px 16px' }">
                            <div :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Falara Job ID</div>
                            <div :style="{ fontSize: '13px', color: '#111827', fontFamily: 'monospace', wordBreak: 'break-all' }">{{ job.falaraJobId || '—' }}</div>
                        </div>
                        <div :style="{ background: '#f9fafb', borderRadius: '8px', padding: '14px 16px' }">
                            <div :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Type</div>
                            <div :style="{ fontSize: '14px', color: '#111827' }">{{ job.resourceType || '—' }}</div>
                        </div>
                        <div :style="{ background: '#f9fafb', borderRadius: '8px', padding: '14px 16px' }">
                            <div :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Target Language</div>
                            <div :style="{ fontSize: '14px', color: '#111827' }">{{ job.targetLocale || '—' }}</div>
                        </div>
                        <div :style="{ background: '#f9fafb', borderRadius: '8px', padding: '14px 16px' }">
                            <div :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Items</div>
                            <div :style="{ fontSize: '14px', color: '#111827' }">{{ job.resourceCount != null ? job.resourceCount : '—' }}</div>
                        </div>
                        <div :style="{ background: '#f9fafb', borderRadius: '8px', padding: '14px 16px' }">
                            <div :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Words</div>
                            <div :style="{ fontSize: '14px', color: '#111827' }">{{ job.wordCount != null ? job.wordCount : '—' }}</div>
                        </div>
                        <div :style="{ background: '#f9fafb', borderRadius: '8px', padding: '14px 16px' }">
                            <div :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Created</div>
                            <div :style="{ fontSize: '14px', color: '#111827' }">{{ formatDate(job.createdAt) }}</div>
                        </div>
                        <div v-if="job.completedAt" :style="{ background: '#f9fafb', borderRadius: '8px', padding: '14px 16px' }">
                            <div :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Completed</div>
                            <div :style="{ fontSize: '14px', color: '#111827' }">{{ formatDate(job.completedAt) }}</div>
                        </div>
                        <div v-if="job.projectName" :style="{ background: '#f9fafb', borderRadius: '8px', padding: '14px 16px' }">
                            <div :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }">Project</div>
                            <div :style="{ fontSize: '14px', color: '#111827' }">{{ job.projectName }}</div>
                        </div>
                    </div>

                    <!-- Retry Button -->
                    <div v-if="job.status === 'writeback_failed'" :style="{ marginBottom: '24px' }">
                        <button
                            @click="retryWriteBack"
                            :disabled="isRetrying"
                            :style="{
                                background: isRetrying ? '#fca5a5' : '#dc2626',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '10px 20px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: isRetrying ? 'not-allowed' : 'pointer'
                            }"
                        >
                            {{ isRetrying ? 'Retrying...' : 'Retry Write-Back' }}
                        </button>
                    </div>

                    <!-- Export Warnings -->
                    <div
                        v-if="hasExportWarnings"
                        :style="{
                            background: '#fffbeb',
                            border: '1px solid #fcd34d',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '20px'
                        }"
                    >
                        <div :style="{ fontWeight: '600', color: '#92400e', marginBottom: '10px', fontSize: '14px' }">
                            ⚠ Export Warnings ({{ job.exportWarnings.length }})
                        </div>
                        <ul :style="{ margin: '0', paddingLeft: '20px' }">
                            <li
                                v-for="(warning, idx) in job.exportWarnings"
                                :key="idx"
                                :style="{ color: '#92400e', fontSize: '13px', marginBottom: '4px' }"
                            >{{ warning }}</li>
                        </ul>
                    </div>

                    <!-- Write-Back Errors -->
                    <div
                        v-if="hasWriteBackErrors"
                        :style="{
                            background: '#fef2f2',
                            border: '1px solid #fca5a5',
                            borderRadius: '8px',
                            padding: '16px'
                        }"
                    >
                        <div
                            :style="{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: showErrors ? '12px' : '0',
                                cursor: 'pointer'
                            }"
                            @click="showErrors = !showErrors"
                        >
                            <span :style="{ fontWeight: '600', color: '#991b1b', fontSize: '14px' }">
                                Write-Back Errors ({{ job.writebackErrors.length }})
                            </span>
                            <span :style="{ color: '#991b1b', fontSize: '13px' }">
                                {{ showErrors ? '▲ Collapse' : '▼ Expand' }}
                            </span>
                        </div>
                        <div v-if="showErrors">
                            <div
                                v-for="(error, idx) in job.writebackErrors"
                                :key="idx"
                                :style="{
                                    background: '#fff',
                                    border: '1px solid #fca5a5',
                                    borderRadius: '6px',
                                    padding: '10px 14px',
                                    marginBottom: '8px'
                                }"
                            >
                                <div v-if="error.code" :style="{ fontSize: '12px', color: '#6b7280', marginBottom: '2px', fontFamily: 'monospace' }">{{ error.code }}</div>
                                <div :style="{ fontSize: '13px', color: '#7f1d1d' }">{{ error.message }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    v-else
                    :style="{
                        background: '#fff',
                        borderRadius: '10px',
                        border: '1px solid #e5e7eb',
                        padding: '48px',
                        textAlign: 'center',
                        color: '#6b7280'
                    }"
                >
                    Job not found.
                </div>

            </div>
        </div>
    `,data(){return{isLoading:!0,isRetrying:!1,job:null,showErrors:!1}},computed:{statusBannerColor(){return this.job&&{written_back:"#f0fdf4",completed:"#f0fdf4",pending:"#fffbeb",queued:"#fffbeb",processing:"#eff6ff",writing_back:"#eff6ff",failed:"#fef2f2",writeback_failed:"#fef2f2",dead:"#fef2f2"}[this.job.status]||"#f9fafb"},statusBadgeColor(){return this.job&&{written_back:"#16a34a",completed:"#16a34a",pending:"#d97706",queued:"#d97706",processing:"#2563eb",writing_back:"#2563eb",failed:"#dc2626",writeback_failed:"#dc2626",dead:"#dc2626"}[this.job.status]||"#6b7280"},isZombie(){if(!this.job||!["pending","processing","queued"].includes(this.job.status))return!1;const e=new Date(this.job.createdAt);return(Date.now()-e.getTime())/1e3/60>15},hasExportWarnings(){return this.job&&Array.isArray(this.job.exportWarnings)&&this.job.exportWarnings.length>0},hasWriteBackErrors(){return this.job&&Array.isArray(this.job.writebackErrors)&&this.job.writebackErrors.length>0}},created(){this.loadJob()},methods:{async loadJob(){var e;this.isLoading=!0;try{const a=await Shopware.Service("falaraApiService").getJob(this.$route.params.id);this.job=((e=a.data)==null?void 0:e.job)||a.data||null}catch{this.job=null}finally{this.isLoading=!1}},async retryWriteBack(){this.isRetrying=!0;try{await Shopware.Service("falaraApiService").retryWriteBack(this.job.id),await this.loadJob(),Shopware.State.dispatch("notification/createNotification",{type:"success",message:"Write-back retry triggered successfully."})}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:"Retry failed. Please try again."})}finally{this.isRetrying=!1}},goBack(){this.$router.push({name:"falara.translation.manager.jobs"})},formatDate(e){return e?new Date(e).toLocaleString():"—"}}});const{Component:T}=Shopware;T.register("falara-audit",{template:`
        <div class="falara-audit">
            <falara-nav-tabs />
            <div :style="{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }">
                <mt-card :title="$t('falara-translation-manager.audit.title')">
                    <p :style="{ marginBottom: '16px', color: '#6b7280' }">{{ $t('falara-translation-manager.audit.description') }}</p>

                    <mt-button
                        variant="primary"
                        :disabled="isScanning"
                        @click="runScan"
                    >
                        {{ isScanning ? $t('falara-translation-manager.audit.scanning') : $t('falara-translation-manager.audit.runScan') }}
                    </mt-button>

                    <mt-loader v-if="isScanning" :style="{ marginTop: '24px' }" />

                    <div v-else-if="results && results.coverage" :style="{ marginTop: '24px' }">

                        <div :style="summaryRowStyle">
                            <div :style="summaryCardStyle">
                                <div :style="summaryLabelStyle">{{ $t('falara-translation-manager.audit.totalWords') }}</div>
                                <div :style="summaryNumberStyle">{{ totalWords.toLocaleString() }}</div>
                            </div>
                            <div :style="summaryCardStyle">
                                <div :style="summaryLabelStyle">{{ $t('falara-translation-manager.audit.totalItems') }}</div>
                                <div :style="summaryNumberStyle">{{ totalItems.toLocaleString() }}</div>
                            </div>
                        </div>

                        <table :style="tableStyle">
                            <thead>
                                <tr>
                                    <th :style="thStyle">{{ $t('falara-translation-manager.audit.contentType') }}</th>
                                    <th :style="thStyleRight">{{ $t('falara-translation-manager.audit.items') }}</th>
                                    <th :style="thStyleRight">{{ $t('falara-translation-manager.audit.words') }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="row in results.coverage" :key="row.type" :style="trStyle">
                                    <td :style="tdStyle">{{ row.label }}</td>
                                    <td :style="tdStyleRight">{{ row.totalItems.toLocaleString() }}</td>
                                    <td :style="tdStyleRight">{{ row.sourceWordCount.toLocaleString() }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div v-else-if="!isScanning" :style="{ marginTop: '24px', color: '#9ca3af' }">
                        <p>{{ $t('falara-translation-manager.audit.noResults') }}</p>
                    </div>
                </mt-card>
            </div>
        </div>
    `,data(){return{isScanning:!1,results:null,salesChannelId:null}},computed:{totalWords(){var e;return(e=this.results)!=null&&e.coverage?this.results.coverage.reduce((t,a)=>t+(a.sourceWordCount||0),0):0},totalItems(){var e;return(e=this.results)!=null&&e.coverage?this.results.coverage.reduce((t,a)=>t+(a.totalItems||0),0):0},summaryRowStyle(){return{display:"flex",gap:"16px",marginBottom:"24px"}},summaryCardStyle(){return{flex:"1",background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:"8px",padding:"20px 24px"}},summaryLabelStyle(){return{fontSize:"13px",color:"#6b7280",marginBottom:"6px",textTransform:"uppercase",letterSpacing:"0.05em"}},summaryNumberStyle(){return{fontSize:"28px",fontWeight:"700",color:"#111827"}},tableStyle(){return{width:"100%",borderCollapse:"collapse",border:"1px solid #e5e7eb",borderRadius:"8px",overflow:"hidden"}},thStyle(){return{background:"#f9fafb",padding:"12px 16px",textAlign:"left",fontSize:"13px",fontWeight:"600",color:"#374151",borderBottom:"1px solid #e5e7eb"}},thStyleRight(){return{background:"#f9fafb",padding:"12px 16px",textAlign:"right",fontSize:"13px",fontWeight:"600",color:"#374151",borderBottom:"1px solid #e5e7eb"}},trStyle(){return{borderBottom:"1px solid #f3f4f6"}},tdStyle(){return{padding:"12px 16px",fontSize:"14px",color:"#374151"}},tdStyleRight(){return{padding:"12px 16px",fontSize:"14px",color:"#374151",textAlign:"right",fontVariantNumeric:"tabular-nums"}}},created(){this.initSalesChannel()},methods:{async initSalesChannel(){const t=await Shopware.Service("repositoryFactory").create("sales_channel").search(new Shopware.Data.Criteria,Shopware.Context.api);t.length>0&&(this.salesChannelId=t.first().id)},async runScan(){if(this.salesChannelId){this.isScanning=!0,this.results=null;try{const t=await Shopware.Service("falaraApiService").runAudit(this.salesChannelId);this.results=t.data||{}}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:this.$t("falara-translation-manager.general.error")})}finally{this.isScanning=!1}}}}});const{Component:A}=Shopware;A.register("falara-settings",{template:`
        <div>
            <falara-nav-tabs />

            <div :style="{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }">
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
                        <div :style="{ ...cardStyle, maxWidth: '720px' }">
                            <h2 :style="cardTitleStyle">Custom Fields Whitelist</h2>

                            <div :style="{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', marginBottom: '24px', fontSize: '13px', lineHeight: '1.5', color: '#166534' }">
                                <strong>What are Custom Fields?</strong><br>
                                Custom Fields are additional translatable fields added to products by plugins or your own configuration (e.g. "Material", "Care Instructions", "USP Headline").
                                Check the fields below to include them in translations. Only <strong>text</strong>, <strong>html</strong>, and <strong>textarea</strong> fields can be translated.
                            </div>

                            <div v-if="isLoadingAvailableFields" :style="{ padding: '32px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }">
                                Loading custom fields…
                            </div>

                            <div v-else-if="availableFieldSets.length === 0" :style="{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px', background: '#f9fafb', borderRadius: '8px', marginBottom: '20px' }">
                                No custom field sets found in your Shopware installation.
                            </div>

                            <div v-else>
                                <div
                                    v-for="set in availableFieldSets"
                                    :key="set.name"
                                    :style="{ marginBottom: '20px' }"
                                >
                                    <div :style="{ fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 0', borderBottom: '1px solid #e5e7eb', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }">
                                        {{ set.label }}
                                        <span v-if="set.entity" :style="{ fontSize: '11px', fontWeight: '400', color: '#9ca3af', textTransform: 'none', letterSpacing: '0' }">{{ set.entity }}</span>
                                    </div>
                                    <div
                                        v-for="field in set.fields"
                                        :key="field.name"
                                        :style="{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 4px', borderRadius: '4px', opacity: field.translatable ? 1 : 0.45 }"
                                    >
                                        <input
                                            type="checkbox"
                                            :id="'cf-' + field.name"
                                            :checked="isFieldWhitelisted(field.name)"
                                            :disabled="!field.translatable"
                                            @change="toggleField(field, set, $event)"
                                            :style="{ width: '16px', height: '16px', cursor: field.translatable ? 'pointer' : 'not-allowed', flexShrink: 0 }"
                                        />
                                        <label
                                            :for="'cf-' + field.name"
                                            :style="{ fontSize: '14px', color: field.translatable ? '#1a1a2e' : '#9ca3af', cursor: field.translatable ? 'pointer' : 'default', flex: 1 }"
                                        >
                                            {{ field.label }}
                                            <span :style="{ fontSize: '12px', color: '#9ca3af', marginLeft: '6px' }">{{ field.name }}</span>
                                            <span v-if="!field.translatable" :style="{ fontSize: '12px', color: '#9ca3af', marginLeft: '6px', fontStyle: 'italic' }">— not translatable</span>
                                        </label>
                                        <span :style="{ fontSize: '11px', color: '#d1d5db', background: '#f3f4f6', borderRadius: '4px', padding: '1px 6px', flexShrink: 0 }">{{ field.type }}</span>
                                    </div>
                                </div>
                            </div>

                            <div v-if="saveMessage" :style="{ padding: '10px 16px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px', background: saveMessage.type === 'success' ? '#f0fdf4' : '#fef2f2', color: saveMessage.type === 'success' ? '#166534' : '#991b1b', border: saveMessage.type === 'success' ? '1px solid #bbf7d0' : '1px solid #fecaca' }">{{ saveMessage.text }}</div>
                            <mt-button variant="primary" @click="saveCustomFields" :disabled="isSaving || isLoadingAvailableFields" :style="{ marginTop: '8px' }">
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
                                <label :style="nativeSelectLabelStyle">Domain</label>
                                <select v-model="defaults.domain" :style="nativeSelectStyle">
                                    <option value="">None</option>
                                    <option value="e-commerce">E-Commerce</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="legal">Legal</option>
                                    <option value="medical">Medical</option>
                                    <option value="technical">Technical</option>
                                    <option value="software">Software</option>
                                </select>
                            </div>

                            <div :style="fieldWrapStyle">
                                <label :style="nativeSelectLabelStyle">Tone</label>
                                <select v-model="defaults.tone" :style="nativeSelectStyle">
                                    <option value="">None</option>
                                    <option value="formal">Formal</option>
                                    <option value="casual">Casual</option>
                                    <option value="technical">Technical</option>
                                </select>
                            </div>

                            <div :style="fieldWrapStyle">
                                <label :style="nativeSelectLabelStyle">Quality</label>
                                <select v-model="defaults.quality" :style="nativeSelectStyle">
                                    <option value="standard">Standard</option>
                                    <option value="premium">Premium</option>
                                </select>
                            </div>

                            <div :style="fieldWrapStyle">
                                <label :style="nativeSelectLabelStyle">Provider</label>
                                <select v-model="defaults.provider" :style="nativeSelectStyle">
                                    <option value="">— Select provider —</option>
                                    <option v-for="opt in providerOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                                </select>
                            </div>

                            <!-- QA Info Box -->
                            <div :style="qaBoxStyle">
                                <div :style="qaIconWrapStyle">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="10" cy="10" r="10" fill="#3b82f6"/>
                                        <path d="M6 10.5L8.5 13L14 7.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </div>
                                <div :style="qaTextWrapStyle">
                                    <div :style="qaTitleStyle">{{ qaTitle }}</div>
                                    <div :style="qaDescStyle">{{ qaDescription }}</div>
                                </div>
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
        </div>
    `,data(){return{isLoading:!0,isSaving:!1,saveMessage:null,isConnecting:!1,isDisconnecting:!1,activeTab:"connection",isConnected:!1,connectionData:{},showDisconnectConfirm:!1,connectForm:{apiKey:""},customFields:[],availableFieldSets:[],isLoadingAvailableFields:!1,whitelistedFields:[],defaults:{sourceLanguage:"",domain:"",tone:"",quality:"standard",provider:"",instructions:""},salesChannelId:null}},computed:{isGerman(){var t;return(((t=Shopware.State.get("session"))==null?void 0:t.currentLocale)||"").startsWith("de")},qaTitle(){return this.isGerman?"Automatische Qualitätssicherung":"Automated Quality Assurance"},qaDescription(){return this.isGerman?"Mehrere automatisierte QA-Agenten prüfen jede Übersetzung auf Qualität — unabhängig von der gewählten Engine. Nur bei falara.io.":"Multiple automated QA agents will review every translation for quality assurance, regardless of engine. Only at falara.io."},qaBoxStyle(){return{display:"flex",alignItems:"flex-start",gap:"12px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:"8px",padding:"16px",marginBottom:"16px"}},qaIconWrapStyle(){return{flexShrink:"0",marginTop:"1px"}},qaTextWrapStyle(){return{display:"flex",flexDirection:"column",gap:"4px"}},qaTitleStyle(){return{fontSize:"14px",fontWeight:"600",color:"#1e40af",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},qaDescStyle(){return{fontSize:"13px",color:"#3b82f6",lineHeight:"1.5",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},nativeSelectLabelStyle(){return{display:"block",fontSize:"13px",fontWeight:"500",color:"#374151",marginBottom:"6px",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},nativeSelectStyle(){return{display:"block",width:"100%",padding:"8px 12px",fontSize:"14px",color:"#374151",background:"#ffffff",border:"1px solid #d1d5db",borderRadius:"6px",appearance:"auto",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},subTabs(){return[{key:"connection",label:"Connection"},{key:"customFields",label:"Custom Fields"},{key:"defaults",label:"Defaults"}]},qualityOptions(){return[{value:"standard",label:"Standard"},{value:"premium",label:"Premium"}]},providerOptions(){return[{value:"deepl",label:"DeepL"},{value:"claude",label:"Claude"},{value:"gemini",label:"Gemini"},{value:"chatgpt",label:"ChatGPT"}]},subTabBarStyle(){return{display:"flex",gap:"0",borderBottom:"1px solid #e5e7eb",marginBottom:"24px",background:"#fff"}},subTabStyle(){return{background:"none",border:"none",borderBottom:"3px solid transparent",padding:"12px 20px",cursor:"pointer",fontSize:"14px",fontWeight:"500",color:"#6b7280",whiteSpace:"nowrap",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif",transition:"all 0.15s ease"}},activeSubTabStyle(){return{...this.subTabStyle,color:"#1a73e8",borderBottomColor:"#1a73e8",fontWeight:"600"}},cardStyle(){return{background:"#fff",borderRadius:"10px",padding:"24px",border:"1px solid #e5e7eb",maxWidth:"560px"}},cardTitleStyle(){return{fontSize:"18px",fontWeight:"700",color:"#1a1a2e",margin:"0 0 20px 0",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},fieldWrapStyle(){return{marginBottom:"16px"}},linkTextStyle(){return{marginTop:"16px",fontSize:"13px",color:"#6b7280"}},linkAStyle(){return{color:"#1a73e8",textDecoration:"underline"}},statusRowStyle(){return{display:"flex",alignItems:"center",marginBottom:"16px"}},statusDotStyle(){return{display:"inline-block",width:"10px",height:"10px",borderRadius:"50%",background:"#22c55e",marginRight:"8px",flexShrink:"0"}},connectedLabelStyle(){return{color:"#16a34a",fontWeight:"600",fontSize:"15px"}},metaBlockStyle(){return{display:"flex",flexDirection:"column",gap:"8px"}},metaLineStyle(){return{display:"flex",gap:"8px",fontSize:"14px"}},metaKeyStyle(){return{color:"#6b7280",minWidth:"130px"}},metaValStyle(){return{color:"#1a1a2e",fontWeight:"500"}},confirmBoxStyle(){return{marginTop:"16px",padding:"16px",background:"#fef2f2",borderRadius:"8px",border:"1px solid #fecaca"}},confirmTextStyle(){return{margin:"0 0 12px 0",fontSize:"14px",color:"#dc2626",fontWeight:"500"}},confirmBtnRowStyle(){return{display:"flex",gap:"8px"}},descStyle(){return{fontSize:"14px",color:"#6b7280",marginBottom:"20px",marginTop:"-12px"}},emptyTextStyle(){return{fontSize:"14px",color:"#9ca3af",fontStyle:"italic",marginBottom:"16px"}},fieldListStyle(){return{listStyle:"none",padding:"0",margin:"0 0 20px 0"}},fieldItemStyle(){return{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #f3f4f6",fontSize:"14px",color:"#374151"}}},created(){this.initSalesChannel()},methods:{onSubTabHover(e,t){this.activeTab!==t&&(e.target.style.color="#1a73e8",e.target.style.background="#f0f4ff")},onSubTabLeave(e,t){this.activeTab!==t&&(e.target.style.color="#6b7280",e.target.style.background="none")},async initSalesChannel(){const t=await Shopware.Service("repositoryFactory").create("sales_channel").search(new Shopware.Data.Criteria,Shopware.Context.api);t.length>0?(this.salesChannelId=t.first().id,await this.loadAll()):this.isLoading=!1},async loadAll(){this.isLoading=!0;try{await Promise.all([this.loadConnection(),this.loadDefaults(),this.loadCustomFields()])}finally{this.isLoading=!1}},async loadConnection(){try{const t=await Shopware.Service("falaraApiService").getConnection(this.salesChannelId),a=t.data&&t.data.connection;this.isConnected=!!(a&&!a.disconnectedAt),this.isConnected?this.connectionData={accountId:a.falaraAccountId,accountName:a.accountName||null,plan:a.plan||null,connectedAt:a.connectedAt||null}:this.connectionData={}}catch{this.isConnected=!1,this.connectionData={}}},async loadDefaults(){try{const t=await Shopware.Service("falaraApiService").getDefaults(this.salesChannelId);t.data&&(this.defaults={...this.defaults,...t.data})}catch{}},async loadCustomFields(){try{const t=await Shopware.Service("falaraApiService").getCustomFields(this.salesChannelId),a=t.data&&t.data.customFields?t.data.customFields:[];this.customFieldEntries=a,this.whitelistedFields=a.map(s=>s.fieldName)}catch{this.customFieldEntries=[],this.whitelistedFields=[]}await this.loadAvailableCustomFields()},async loadAvailableCustomFields(){this.isLoadingAvailableFields=!0;try{const t=await Shopware.Service("falaraApiService").getAvailableCustomFields(this.salesChannelId);this.availableFieldSets=t.data&&t.data.sets?t.data.sets:[]}catch{this.availableFieldSets=[]}finally{this.isLoadingAvailableFields=!1}},async connect(){this.isConnecting=!0;try{await Shopware.Service("falaraApiService").connect(this.salesChannelId,this.connectForm.apiKey),this.connectForm.apiKey="",await this.loadConnection(),Shopware.State.dispatch("notification/createNotification",{type:"success",message:"Connected successfully."})}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:"Connection failed. Please check your API key."})}finally{this.isConnecting=!1}},async disconnect(){this.showDisconnectConfirm=!1,this.isDisconnecting=!0;try{await Shopware.Service("falaraApiService").disconnect(this.salesChannelId),await this.loadConnection(),Shopware.State.dispatch("notification/createNotification",{type:"success",message:"Disconnected successfully."})}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:"Disconnect failed. Please try again."})}finally{this.isDisconnecting=!1}},isFieldWhitelisted(e){return this.whitelistedFields.includes(e)},toggleField(e,t,a){if(a.target.checked)this.whitelistedFields.includes(e.name)||(this.whitelistedFields.push(e.name),this.pendingAdditions=this.pendingAdditions||[],this.pendingAdditions.push({fieldSetName:t.name,fieldName:e.name}));else{const s=this.whitelistedFields.indexOf(e.name);s!==-1&&(this.whitelistedFields.splice(s,1),this.pendingRemovals=this.pendingRemovals||[],this.pendingRemovals.push(e.name))}},async saveCustomFields(){this.isSaving=!0;try{const e=Shopware.Service("falaraApiService"),t=(this.customFieldEntries||[]).map(i=>i.fieldName),a=this.whitelistedFields.filter(i=>!t.includes(i)),s=(this.customFieldEntries||[]).filter(i=>!this.whitelistedFields.includes(i.fieldName)),r=a.map(i=>{let n="";for(const o of this.availableFieldSets)if(o.fields.find(p=>p.name===i)){n=o.name;break}return e.addCustomField(this.salesChannelId,n,i)}),d=s.map(i=>e.deleteCustomField(i.id));await Promise.all([...r,...d]),await this.loadCustomFields(),this.saveMessage={type:"success",text:"Custom fields saved successfully."},setTimeout(()=>{this.saveMessage=null},4e3)}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:"Failed to save custom fields."})}finally{this.isSaving=!1}},async saveDefaults(){this.isSaving=!0;try{await Shopware.Service("falaraApiService").saveDefaults(this.salesChannelId,this.defaults),Shopware.State.dispatch("notification/createNotification",{type:"success",message:"Defaults saved."})}catch{Shopware.State.dispatch("notification/createNotification",{type:"error",message:"Failed to save defaults."})}finally{this.isSaving=!1}},formatDate(e){if(!e)return"";try{return new Date(e).toLocaleDateString(void 0,{year:"numeric",month:"long",day:"numeric"})}catch{return e}}}});const{Component:I}=Shopware;I.register("falara-status-badge",{template:`
        <div class="falara-status-badge" :class="badgeClass" :title="tooltipText">
            <span class="falara-status-badge__dot"></span>
            <span class="falara-status-badge__label">{{ labelText }}</span>
        </div>
    `,props:{status:{type:String,required:!0}},computed:{badgeClass(){return{pending:"falara-status-badge--yellow",queued:"falara-status-badge--yellow",processing:"falara-status-badge--blue",writing_back:"falara-status-badge--blue",completed:"falara-status-badge--green",written_back:"falara-status-badge--green",needs_review:"falara-status-badge--green",failed:"falara-status-badge--red",dead:"falara-status-badge--red",writeback_failed:"falara-status-badge--red"}[this.status]||"falara-status-badge--grey"},labelText(){const e=`falara-translation-manager.status.${this.status}`;return this.$t(e)},tooltipText(){const e=`falara-translation-manager.status.${this.status}_tooltip`;return this.$t(e)}}});const{Component:B}=Shopware;B.register("falara-quota-widget",{template:`
        <div :style="containerStyle">
            <div :style="headerStyle">
                <span :style="planStyle">Plan: <strong>{{ planName }}</strong></span>
                <span :style="numbersStyle">{{ wordsUsed.toLocaleString() }} / {{ wordsLimit.toLocaleString() }}</span>
            </div>
            <div :style="barBgStyle">
                <div :style="barFillStyle"></div>
            </div>
            <div :style="footerStyle">
                <span :style="remainingStyle">Remaining: {{ wordsRemaining.toLocaleString() }}</span>
                <span v-if="bonusWords > 0" :style="bonusStyle">+{{ bonusWords.toLocaleString() }} bonus</span>
            </div>
            <div v-if="isExceeded" :style="alertDangerStyle">Quota exhausted. Please upgrade your plan.</div>
            <div v-else-if="isWarning" :style="alertWarningStyle">You have used over 80% of your quota.</div>
        </div>
    `,props:{usage:{type:Object,required:!0,default:()=>({})}},computed:{wordsUsed(){return this.usage.wordsUsed||this.usage.used||0},wordsLimit(){return this.usage.wordsLimit||this.usage.limit||0},wordsRemaining(){return this.usage.wordsRemaining||Math.max(this.wordsLimit-this.wordsUsed,0)},planName(){return this.usage.plan||"-"},bonusWords(){return this.usage.bonusWordsAvailable||0},progressValue(){return this.wordsLimit===0?0:Math.min(Math.round(this.wordsUsed/this.wordsLimit*100),100)},isWarning(){return this.progressValue>=80&&this.progressValue<100},isExceeded(){return this.progressValue>=100},containerStyle(){return{background:"#fff",borderRadius:"10px",border:"1px solid #e5e7eb",padding:"20px"}},headerStyle(){return{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}},planStyle(){return{fontSize:"14px",color:"#374151"}},numbersStyle(){return{fontSize:"14px",color:"#6b7280",fontWeight:"500"}},barBgStyle(){return{height:"8px",background:"#e5e7eb",borderRadius:"4px",overflow:"hidden"}},barFillStyle(){const e=this.isExceeded?"#ef4444":this.isWarning?"#f59e0b":"#22c55e";return{height:"100%",width:this.progressValue+"%",background:e,borderRadius:"4px",transition:"width 0.3s ease"}},footerStyle(){return{display:"flex",justifyContent:"space-between",marginTop:"8px",fontSize:"13px"}},remainingStyle(){return{color:"#6b7280"}},bonusStyle(){return{color:"#3b82f6",fontWeight:"500"}},alertDangerStyle(){return{marginTop:"10px",padding:"8px 12px",background:"#fef2f2",color:"#991b1b",border:"1px solid #fecaca",borderRadius:"6px",fontSize:"13px"}},alertWarningStyle(){return{marginTop:"10px",padding:"8px 12px",background:"#fffbeb",color:"#92400e",border:"1px solid #fde68a",borderRadius:"6px",fontSize:"13px"}}}});const{Component:$}=Shopware;$.register("falara-translate-modal",{template:`
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
                            :value="lang.code"
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
                        <select v-model="form.domain" :style="selectStyle">
                            <option value="">None</option>
                            <option value="e-commerce">E-Commerce</option>
                            <option value="marketing">Marketing</option>
                            <option value="legal">Legal</option>
                            <option value="medical">Medical</option>
                            <option value="technical">Technical</option>
                            <option value="software">Software</option>
                        </select>
                    </div>

                    <div :style="fieldGroupStyle">
                        <label :style="labelStyle">{{ $t('falara-translation-manager.modal.tone') }}</label>
                        <select v-model="form.tone" :style="selectStyle">
                            <option value="">None</option>
                            <option value="formal">Formal</option>
                            <option value="casual">Casual</option>
                            <option value="technical">Technical</option>
                        </select>
                    </div>

                    <div :style="fieldGroupStyle">
                        <label :style="labelStyle">{{ $t('falara-translation-manager.modal.quality') }}</label>
                        <select v-model="form.quality" :style="selectStyle">
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
    `,emits:["translate","cancel"],props:{items:{type:Array,required:!0,default:()=>[]},salesChannelId:{type:String,required:!0},defaults:{type:Object,default:()=>({})}},data(){return{selectedLanguages:[],selectedGlossary:null,showAdvanced:!1,availableLanguages:[],glossaries:[],form:{domain:"",tone:"",quality:"standard",instructions:""}}},computed:{containerStyle(){return{background:"#ffffff",borderRadius:"10px",padding:"24px",boxShadow:"0 4px 24px rgba(0,0,0,0.10)",fontFamily:"inherit"}},summaryStyle(){return{display:"inline-block",background:"#f3f4f6",borderRadius:"999px",padding:"4px 16px",fontSize:"13px",color:"#6b7280",marginBottom:"20px",fontWeight:"500"}},sectionStyle(){return{marginBottom:"20px"}},langGridStyle(){return{display:"grid",gridTemplateColumns:"repeat(3, 1fr)",gap:"8px",marginTop:"8px"}},langItemStyle(){return{display:"flex",alignItems:"center",gap:"6px"}},checkboxStyle(){return{cursor:"pointer",width:"15px",height:"15px",flexShrink:"0"}},checkboxLabelStyle(){return{fontSize:"13px",color:"#374151",cursor:"pointer"}},selectStyle(){return{width:"100%",padding:"8px 12px",border:"1px solid #d1d5db",borderRadius:"6px",fontSize:"14px",background:"#fff",color:"#111827",outline:"none",cursor:"pointer",height:"40px"}},labelStyle(){return{display:"block",fontSize:"13px",fontWeight:"600",color:"#374151",marginBottom:"4px"}},toggleStyle(){return{background:"none",border:"none",padding:"0",fontSize:"13px",fontWeight:"600",color:"#6366f1",cursor:"pointer",textDecoration:"underline"}},advancedContentStyle(){return{marginTop:"16px",display:"flex",flexDirection:"column",gap:"16px"}},fieldGroupStyle(){return{display:"flex",flexDirection:"column"}},actionsStyle(){return{display:"flex",justifyContent:"flex-end",gap:"12px",borderTop:"1px solid #e5e7eb",paddingTop:"20px",marginTop:"4px"}}},created(){this.loadLanguages(),this.loadGlossaries(),this.applyDefaults()},methods:{getLanguageList(){return[{id:"de",name:"German (de)",code:"de"},{id:"de-AT",name:"German - Austria (de-AT)",code:"de-AT"},{id:"de-CH",name:"German - Switzerland (de-CH)",code:"de-CH"},{id:"en-GB",name:"English - UK (en-GB)",code:"en-GB"},{id:"en-US",name:"English - US (en-US)",code:"en-US"},{id:"fr",name:"French (fr)",code:"fr"},{id:"fr-BE",name:"French - Belgium (fr-BE)",code:"fr-BE"},{id:"fr-CH",name:"French - Switzerland (fr-CH)",code:"fr-CH"},{id:"fr-CA",name:"French - Canada (fr-CA)",code:"fr-CA"},{id:"es",name:"Spanish (es)",code:"es"},{id:"it",name:"Italian (it)",code:"it"},{id:"it-CH",name:"Italian - Switzerland (it-CH)",code:"it-CH"},{id:"nl",name:"Dutch (nl)",code:"nl"},{id:"nl-BE",name:"Dutch - Belgium (nl-BE)",code:"nl-BE"},{id:"pt-PT",name:"Portuguese - Portugal (pt-PT)",code:"pt-PT"},{id:"pt-BR",name:"Portuguese - Brazil (pt-BR)",code:"pt-BR"},{id:"pl",name:"Polish (pl)",code:"pl"},{id:"cs",name:"Czech (cs)",code:"cs"},{id:"da",name:"Danish (da)",code:"da"},{id:"sv",name:"Swedish (sv)",code:"sv"},{id:"fi",name:"Finnish (fi)",code:"fi"},{id:"no",name:"Norwegian (no)",code:"no"},{id:"hu",name:"Hungarian (hu)",code:"hu"},{id:"ro",name:"Romanian (ro)",code:"ro"},{id:"bg",name:"Bulgarian (bg)",code:"bg"},{id:"hr",name:"Croatian (hr)",code:"hr"},{id:"sk",name:"Slovak (sk)",code:"sk"},{id:"sl",name:"Slovenian (sl)",code:"sl"},{id:"el",name:"Greek (el)",code:"el"},{id:"tr",name:"Turkish (tr)",code:"tr"},{id:"ru",name:"Russian (ru)",code:"ru"},{id:"uk",name:"Ukrainian (uk)",code:"uk"}]},applyDefaults(){this.defaults&&(this.form.domain=this.defaults.domain||"",this.form.tone=this.defaults.tone||"",this.form.quality=this.defaults.quality||"standard",this.form.instructions=this.defaults.instructions||"",this.defaults.targetLanguages&&(this.selectedLanguages=[...this.defaults.targetLanguages]),this.defaults.glossaryId&&(this.selectedGlossary=this.defaults.glossaryId))},loadLanguages(){this.availableLanguages=this.getLanguageList()},loadGlossaries(){Shopware.Service("falaraApiService").getGlossaries(this.salesChannelId).then(t=>{const a=t.data;this.glossaries=Array.isArray(a)?a:(a==null?void 0:a.glossaries)||(a==null?void 0:a.items)||[]}).catch(()=>{this.glossaries=[]})},onTranslate(){this.selectedLanguages.length!==0&&this.$emit("translate",{items:this.items,salesChannelId:this.salesChannelId,targetLanguages:this.selectedLanguages,glossaryId:this.selectedGlossary,...this.form})}}});const{Component:L}=Shopware;L.register("falara-nav-tabs",{template:`
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
    `,computed:{containerStyle(){return{background:"#fff",borderBottom:"1px solid #d1d5db",margin:"-20px -20px 24px -20px",padding:"0",borderRadius:"8px 8px 0 0"}},headerStyle(){return{padding:"24px 32px 0 32px"}},titleStyle(){return{fontSize:"24px",fontWeight:"700",color:"#1a1a2e",margin:"0 0 16px 0",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif"}},barStyle(){return{display:"flex",gap:"0",padding:"0 32px",borderTop:"1px solid #e5e7eb"}},tabStyle(){return{background:"none",border:"none",borderBottom:"3px solid transparent",padding:"14px 20px",cursor:"pointer",fontSize:"14px",fontWeight:"500",color:"#6b7280",whiteSpace:"nowrap",fontFamily:"Inter, -apple-system, BlinkMacSystemFont, sans-serif",transition:"all 0.15s ease"}},activeTabStyle(){return{...this.tabStyle,color:"#1a73e8",borderBottomColor:"#1a73e8",fontWeight:"600"}},tabs(){return[{route:"falara.translation.manager.dashboard",label:"falara-translation-manager.nav.dashboard"},{route:"falara.translation.manager.content",label:"falara-translation-manager.nav.content"},{route:"falara.translation.manager.jobs",label:"falara-translation-manager.nav.jobs"},{route:"falara.translation.manager.audit",label:"falara-translation-manager.nav.audit"},{route:"falara.translation.manager.settings",label:"falara-translation-manager.nav.settings"}]}},methods:{isActive(e){const t=this.$route.name;return t?t===e||e==="falara.translation.manager.jobs"&&t==="falara.translation.manager.job-detail":!1},navigate(e){this.isActive(e)||this.$router.push({name:e})}}});const{Module:j}=Shopware;j.register("falara-translation-manager",{type:"plugin",name:"falara-translation-manager.general.title",title:"falara-translation-manager.general.title",description:"falara-translation-manager.general.description",color:"#1a73e8",icon:"regular-language",snippets:{"de-DE":()=>h(()=>import("./de-DE-iMwx0j41.js"),[]),"en-GB":()=>h(()=>import("./en-GB-uHKYb3pO.js"),[])},routes:{dashboard:{component:"falara-dashboard",path:"dashboard"},content:{component:"falara-content",path:"content/:type?"},jobs:{component:"falara-jobs",path:"jobs"},"job-detail":{component:"falara-job-detail",path:"jobs/:id"},audit:{component:"falara-audit",path:"audit"},settings:{component:"falara-settings",path:"settings"}},navigation:[{label:"falara-translation-manager.general.title",color:"#1a73e8",icon:"regular-language",path:"falara.translation.manager.dashboard",parent:"sw-settings",position:100}]});
//# sourceMappingURL=falara-translation-manager-pMVSJ92B.js.map
