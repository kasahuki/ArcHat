<template>
  <div class="container">
  
  <div class="notice-center-glass-pc">
    <div class="notice-center-header-pc">
      <h1 class="notice-title-pc" style="display: flex; gap:12px; align-items: center;"> <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 48 48"><!-- Icon from Flat Color Icons by Icons8 - undefined --><path fill="#2196F3" d="M37 40H11l-6 6V12c0-3.3 2.7-6 6-6h26c3.3 0 6 2.7 6 6v22c0 3.3-2.7 6-6 6"/><g fill="#fff"><path d="M22 20h4v11h-4z"/><circle cx="24" cy="15" r="2"/></g></svg>消息中心</h1>
   
      <div class="notice-search-bar">
        <PurpleInput
          v-model="searchText"
          placeholder="Search..."
          :icon="SearchIcon"
          :width="350"
        />
      </div>
    </div>
   
    <!-- 新增仪表盘卡片布局 -->
    <div class="dashboard-section">
    <div class="dashboard-cards">
      <div v-for="(stat, idx) in dashboardStats" :key="idx" class="dashboard-card">
        <div class="dashboard-card-icon" :style="{background: stat.bg, color: stat.color}" v-html="stat.icon"></div>
        <div class="dashboard-card-info">
          <div class="dashboard-card-title">{{ stat.value }}</div>
          <div class="dashboard-card-desc">{{ stat.desc }}</div>
        </div>
      </div>
    </div>
    <div class="dashboard-main">
      <div class="dashboard-group-invites">
        <div class="dashboard-section-title-row">
          <span class="dashboard-section-title">群聊邀请</span>
          <span class="dashboard-section-icons">
            <component :is="SearchIcon" />
            <component :is="FilterIcon" />
          </span>
        </div>
        <table class="dashboard-table">
          <thead>
            <tr><th>Inviter</th><th>Group</th><th>Date</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr v-for="invite in pagedGroupInvites" :key="invite.inviter + invite.group + invite.date">
              <td><img :src="invite.avatar" class="dashboard-avatar"/> {{ invite.inviter }}</td>
              <td>{{ invite.group }}</td>
              <td>{{ invite.date }}</td>
              <td>
                <span class="dashboard-status" :class="invite.status.toLowerCase()">{{ invite.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      <el-pagination
        background
        layout="prev, pager, next"
          :total="groupInvites.length"
          :page-size="groupInvitePageSize"
          :current-page="groupInvitePage"
          @current-change="handleGroupInvitePageChange"
          style="margin-top:16px;justify-content:flex-end;"
      />
    </div>
      <div class="dashboard-sysmsgs">
        <div class="dashboard-section-title-row">
          <span class="dashboard-section-title">系统消息</span>
          <span class="dashboard-section-icons">
            <component :is="SearchIcon" />
            <component :is="FilterIcon" />
          </span>
        </div>
        <ul class="dashboard-todo-list">
          <li v-for="(msg, idx) in sysMessages" :key="idx" :class="msg.type">
            <span></span>
            <component :is="getSysMsgIcon(msg.type)" style="margin-right:8px;" />
            {{ msg.text }}
          </li>
        </ul>
          </div>
        </div>
      </div>
  <!-- 仪表盘卡片布局结束 -->
  </div>

  <div class="notice-leave-row">
    <div class="notice-card-demo">
      <div class="notice-card-demo-title">联系平台</div>
      <div class="notice-card-demo-desc">
        <!-- 社交玻璃片区域 -->
        <div class="social-glass-row">
          <a class="social-glass-btn" href="https://github.com/" target="_blank" title="GitHub">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path fill="#222" d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.847-2.338 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.579.688.481C19.138 20.2 22 16.448 22 12.021 22 6.484 17.523 2 12 2Z"/></svg>
          </a>
          <a class="social-glass-btn" href="https://facebook.com/" target="_blank" title="Facebook">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path fill="#1877F3" d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
          </a>
          <a class="social-glass-btn" href="https://twitter.com/" target="_blank" title="Twitter">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path fill="#1DA1F2" d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195A4.916 4.916 0 0 0 16.616 3c-2.72 0-4.924 2.206-4.924 4.924 0 .386.044.763.127 1.124C7.728 8.807 4.1 6.884 1.671 3.965c-.423.722-.666 1.561-.666 2.475 0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.212c9.057 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg>
          </a>
          <a class="social-glass-btn" href="https://linkedin.com/" target="_blank" title="LinkedIn">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path fill="#0077B5" d="M20.447 20.452h-3.554v-5.569c0-1.327-.025-3.037-1.849-3.037-1.851 0-2.132 1.445-2.132 2.939v5.667H9.358V9h3.414v1.561h.049c.476-.899 1.637-1.849 3.37-1.849 3.602 0 4.267 2.369 4.267 5.455v6.285zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .771 0 1.723v20.549C0 23.229.792 24 1.771 24h20.451C23.2 24 24 23.229 24 22.271V1.723C24 .771 23.2 0 22.225 0z"/></svg>
          </a>
          <a class="social-glass-btn" href="#" title="微信">
           <svg t="1753239347883" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4514" width="32"><path d="M337.387283 341.82659c-17.757225 0-35.514451 11.83815-35.514451 29.595375s17.757225 29.595376 35.514451 29.595376 29.595376-11.83815 29.595376-29.595376c0-18.49711-11.83815-29.595376-29.595376-29.595375zM577.849711 513.479769c-11.83815 0-22.936416 12.578035-22.936416 23.6763 0 12.578035 11.83815 23.676301 22.936416 23.676301 17.757225 0 29.595376-11.83815 29.595376-23.676301s-11.83815-23.676301-29.595376-23.6763zM501.641618 401.017341c17.757225 0 29.595376-12.578035 29.595376-29.595376 0-17.757225-11.83815-29.595376-29.595376-29.595375s-35.514451 11.83815-35.51445 29.595375 17.757225 29.595376 35.51445 29.595376zM706.589595 513.479769c-11.83815 0-22.936416 12.578035-22.936416 23.6763 0 12.578035 11.83815 23.676301 22.936416 23.676301 17.757225 0 29.595376-11.83815 29.595376-23.676301s-11.83815-23.676301-29.595376-23.6763z" fill="#28C445" p-id="4515"></path><path d="M510.520231 2.959538C228.624277 2.959538 0 231.583815 0 513.479769s228.624277 510.520231 510.520231 510.520231 510.520231-228.624277 510.520231-510.520231-228.624277-510.520231-510.520231-510.520231zM413.595376 644.439306c-29.595376 0-53.271676-5.919075-81.387284-12.578034l-81.387283 41.433526 22.936416-71.768786c-58.450867-41.433526-93.965318-95.445087-93.965317-159.815029 0-113.202312 105.803468-201.988439 233.803468-201.98844 114.682081 0 216.046243 71.028902 236.023121 166.473989-7.398844-0.739884-14.797688-1.479769-22.196532-1.479769-110.982659 1.479769-198.289017 85.086705-198.289017 188.67052 0 17.017341 2.959538 33.294798 7.398844 49.572255-7.398844 0.739884-15.537572 1.479769-22.936416 1.479768z m346.265896 82.867052l17.757225 59.190752-63.630058-35.514451c-22.936416 5.919075-46.612717 11.83815-70.289017 11.83815-111.722543 0-199.768786-76.947977-199.768786-172.393063-0.739884-94.705202 87.306358-171.653179 198.289017-171.65318 105.803468 0 199.028902 77.687861 199.028902 172.393064 0 53.271676-34.774566 100.624277-81.387283 136.138728z" fill="#28C445" p-id="4516"></path></svg>
          </a>
          <a class="social-glass-btn" href="#" title="QQ">
            <svg t="1753239600857" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6653" width="32" ><path d="M511.09761 957.257c-80.159 0-153.737-25.019-201.11-62.386-24.057 6.702-54.831 17.489-74.252 30.864-16.617 11.439-14.546 23.106-11.55 27.816 13.15 20.689 225.583 13.211 286.912 6.767v-3.061z" fill="#FAAD08" p-id="6654"></path><path d="M496.65061 957.257c80.157 0 153.737-25.019 201.11-62.386 24.057 6.702 54.83 17.489 74.253 30.864 16.616 11.439 14.543 23.106 11.55 27.816-13.15 20.689-225.584 13.211-286.914 6.767v-3.061z" fill="#FAAD08" p-id="6655"></path><path d="M497.12861 474.524c131.934-0.876 237.669-25.783 273.497-35.34 8.541-2.28 13.11-6.364 13.11-6.364 0.03-1.172 0.542-20.952 0.542-31.155C784.27761 229.833 701.12561 57.173 496.64061 57.162 292.15661 57.173 209.00061 229.832 209.00061 401.665c0 10.203 0.516 29.983 0.547 31.155 0 0 3.717 3.821 10.529 5.67 33.078 8.98 140.803 35.139 276.08 36.034h0.972z" fill="#000000" p-id="6656"></path><path d="M860.28261 619.782c-8.12-26.086-19.204-56.506-30.427-85.72 0 0-6.456-0.795-9.718 0.148-100.71 29.205-222.773 47.818-315.792 46.695h-0.962C410.88561 582.017 289.65061 563.617 189.27961 534.698 185.44461 533.595 177.87261 534.063 177.87261 534.063 166.64961 563.276 155.56661 593.696 147.44761 619.782 108.72961 744.168 121.27261 795.644 130.82461 796.798c20.496 2.474 79.78-93.637 79.78-93.637 0 97.66 88.324 247.617 290.576 248.996a718.01 718.01 0 0 1 5.367 0C708.80161 950.778 797.12261 800.822 797.12261 703.162c0 0 59.284 96.111 79.783 93.637 9.55-1.154 22.093-52.63-16.623-177.017" fill="#000000" p-id="6657"></path><path d="M434.38261 316.917c-27.9 1.24-51.745-30.106-53.24-69.956-1.518-39.877 19.858-73.207 47.764-74.454 27.875-1.224 51.703 30.109 53.218 69.974 1.527 39.877-19.853 73.2-47.742 74.436m206.67-69.956c-1.494 39.85-25.34 71.194-53.24 69.956-27.888-1.238-49.269-34.559-47.742-74.435 1.513-39.868 25.341-71.201 53.216-69.974 27.909 1.247 49.285 34.576 47.767 74.453" fill="#FFFFFF" p-id="6658"></path><path d="M683.94261 368.627c-7.323-17.609-81.062-37.227-172.353-37.227h-0.98c-91.29 0-165.031 19.618-172.352 37.227a6.244 6.244 0 0 0-0.535 2.505c0 1.269 0.393 2.414 1.006 3.386 6.168 9.765 88.054 58.018 171.882 58.018h0.98c83.827 0 165.71-48.25 171.881-58.016a6.352 6.352 0 0 0 1.002-3.395c0-0.897-0.2-1.736-0.531-2.498" fill="#FAAD08" p-id="6659"></path><path d="M467.63161 256.377c1.26 15.886-7.377 30-19.266 31.542-11.907 1.544-22.569-10.083-23.836-25.978-1.243-15.895 7.381-30.008 19.25-31.538 11.927-1.549 22.607 10.088 23.852 25.974m73.097 7.935c2.533-4.118 19.827-25.77 55.62-17.886 9.401 2.07 13.75 5.116 14.668 6.316 1.355 1.77 1.726 4.29 0.352 7.684-2.722 6.725-8.338 6.542-11.454 5.226-2.01-0.85-26.94-15.889-49.905 6.553-1.579 1.545-4.405 2.074-7.085 0.242-2.678-1.834-3.786-5.553-2.196-8.135" fill="#000000" p-id="6660"></path><path d="M504.33261 584.495h-0.967c-63.568 0.752-140.646-7.504-215.286-21.92-6.391 36.262-10.25 81.838-6.936 136.196 8.37 137.384 91.62 223.736 220.118 224.996H506.48461c128.498-1.26 211.748-87.612 220.12-224.996 3.314-54.362-0.547-99.938-6.94-136.203-74.654 14.423-151.745 22.684-215.332 21.927" fill="#FFFFFF" p-id="6661"></path><path d="M323.27461 577.016v137.468s64.957 12.705 130.031 3.91V591.59c-41.225-2.262-85.688-7.304-130.031-14.574" fill="#EB1C26" p-id="6662"></path><path d="M788.09761 432.536s-121.98 40.387-283.743 41.539h-0.962c-161.497-1.147-283.328-41.401-283.744-41.539l-40.854 106.952c102.186 32.31 228.837 53.135 324.598 51.926l0.96-0.002c95.768 1.216 222.4-19.61 324.6-51.924l-40.855-106.952z" fill="#EB1C26" p-id="6663"></path></svg>
          </a>
          <a class="social-glass-btn" href="https://google.com/" target="_blank" title="Google">
            <svg t="1753239711396" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8618" width="32" ><path d="M69.12 929.28L222.72 960V412.16c-51.2-37.376-102.4-75.264-153.6-112.64v629.76z" fill="#3399FF" p-id="8619"></path><path d="M514.56 632.32C366.08 521.216 217.6 410.624 69.12 299.52c-3.584-6.144-11.264-20.992-10.24-40.96 1.536-24.576 15.36-40.448 20.48-46.08 13.312-13.824 28.16-18.432 35.84-20.48 15.872-4.096 29.184-1.536 35.84 0 121.344 88.576 242.176 177.664 363.52 266.24 95.744-71.68 190.976-143.36 286.72-215.04v179.2c-95.744 70.144-190.976 139.776-286.72 209.92z" fill="#FF3333" p-id="8620"></path><path d="M954.88 929.28V304.64c-51.2 39.424-102.4 78.336-153.6 117.76v542.72c51.2-11.776 102.4-24.064 153.6-35.84z" fill="#339966" p-id="8621"></path><path d="M801.28 243.2v174.08c51.2-37.376 102.4-75.264 153.6-112.64 1.536-11.776 3.584-24.064 5.12-35.84-0.512-8.704-2.56-26.112-15.36-40.96-9.216-10.752-19.968-15.872-30.72-20.48-16.384-7.168-31.232-9.728-40.96-10.24-24.064 15.36-47.616 30.72-71.68 46.08z" fill="#FFCC00" p-id="8622"></path></svg>
          </a>
          <a class="social-glass-btn" href="mailto:example@email.com" title="gitee">
            <svg t="1753239775028" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10674" width="32" ><path d="M978.462488 409.612507H455.099994a45.512499 45.512499 0 0 0-45.512499 45.5v113.749999a45.499999 45.499999 0 0 0 45.512499 45.512499h318.624997a45.499999 45.499999 0 0 1 45.499999 45.499999v22.7625a136.524998 136.524998 0 0 1-136.524998 136.524999h-432.374995a45.512499 45.512499 0 0 1-45.5125-45.5V341.350008a136.512498 136.512498 0 0 1 136.524999-136.524998h637.062492a45.512499 45.512499 0 0 0 45.5125-45.487499l0.099999-113.749999A45.512499 45.512499 0 0 0 978.462488 0.000012H341.324996C152.824998 0.000012 0 152.825011 0 341.325008v637.137493a45.512499 45.512499 0 0 0 45.499999 45.512499h671.249992c169.662498 0 307.199996-137.499998 307.199997-307.187496V455.125007a45.512499 45.512499 0 0 0-45.5125-45.5125z m0 0" fill="#C71D23" p-id="10675"></path></svg>
          </a>
          <a class="social-glass-btn" href="https://mail.qq.com/" target="_blank" title="QQ邮箱">
           <svg t="1753239743042" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9707" width="32" ><path d="M130.88793283 512l-175.64295268-178.95697067H-147.48957709v381.11206717h102.73455724v-271.74947398l172.32893471 178.95697066 182.27098864-185.58500661v271.74947396H412.57946075v-79.53643139c-33.14017975-33.14017975-49.71026963-76.22241343-49.71026964-122.61866509 0-49.71026963 19.88410785-92.79250331 49.71026964-122.61866508v-53.02428761h-102.73455725L130.88793283 512z" fill="#2C91DE" p-id="9708"></path><path d="M760.55134815 584.90839547c-23.19812583 0-39.7682157 19.88410785-39.7682157 19.88410784-72.90839547 66.2803595-178.95697067 76.22241343-261.80742006 23.19812583 39.7682157 59.65232355 106.0485752 99.42053925 182.27098864 99.42053925 62.96634153 0 122.61866509-26.51214381 162.3868808-72.90839545 0 0 3.31401797-16.57008987 3.31401798-26.5121438-6.62803595-26.51214381-23.19812583-43.08223369-46.39625166-43.08223367z" fill="#ED4636" p-id="9709"></path><path d="M906.36813906 432.46356859h89.47848533V710.84107852h-89.47848533v-278.37750993z m175.64295269-139.18875496h89.47848534V710.84107852h-89.47848534V293.27481363zM893.11206717 349.6131192c0 33.14017975 26.51214381 56.33830558 56.33830558 56.3383056 33.14017975 0 56.33830558-26.51214381 56.33830556-56.3383056 0-29.82616178-26.51214381-56.33830558-56.33830556-56.33830557s-56.33830558 23.19812583-56.33830558 56.33830557z" fill="#2C91DE" p-id="9710"></path><path d="M681.01491675 296.58883161s-16.57008987 3.31401797-26.51214381 9.94205392c-16.57008987 13.2560719-23.19812583 36.45419773-9.94205392 56.33830558 13.2560719 19.88410785 36.45419773 23.19812583 36.45419773 23.19812583 49.71026963 16.57008987 92.79250331 49.71026963 122.61866508 96.10652128 19.88410785 36.45419773 29.82616178 76.22241343 26.5121438 119.30464711 33.14017975-62.96634153 33.14017975-139.18875497-3.31401798-205.46911447-33.14017975-49.71026963-86.16446736-89.47848533-145.8167909-99.42053925z" fill="#82D531" p-id="9711"></path><path d="M512 571.65232355c13.2560719-19.88410785 3.31401797-43.08223369 3.31401797-43.08223368-13.2560719-53.02428761-3.31401797-106.0485752 23.19812584-152.44482685 19.88410785-36.45419773 53.02428761-62.96634153 89.47848533-82.85044939-69.59437748 3.31401797-135.87473698 39.7682157-175.64295269 106.0485752-29.82616178 53.02428761-36.45419773 115.99062914-16.57008988 175.6429527 0 0 9.94205392 9.94205392 23.19812582 16.57008988 16.57008987 9.94205392 39.7682157 3.31401797 53.02428761-19.88410786z" fill="#F8BE32" p-id="9712"></path><path d="M714.1550965 535.19812583c-3.31401797-16.57008987-16.57008987-29.82616178-16.57008989-29.82616178 3.31401797-16.57008987-3.31401797-16.57008987-3.31401797-16.57008988 0-49.71026963-43.08223369-46.39625165-43.08223367-46.39625165s-43.08223369 0-43.08223369 46.39625165c0 0-6.62803595 3.31401797-3.31401797 16.57008988 0 0-13.2560719 9.94205392-16.57008988 29.82616178 0 0-3.31401797 29.82616178 13.2560719 3.31401798 0 0 3.31401797 9.94205392 9.94205392 16.57008988 0 0-9.94205392 3.31401797-9.94205392 13.25607189 0 0 0 9.94205392 23.19812584 9.94205392 0 0 16.57008987 0 23.19812581-9.94205392h6.62803596c6.62803595 6.62803595 23.19812583 9.94205392 23.19812582 9.94205392 26.51214381 0 23.19812583-9.94205392 23.19812583-9.94205392 0-9.94205392-9.94205392-13.2560719-9.94205392-13.25607189 6.62803595-9.94205392 9.94205392-16.57008987 9.94205392-16.57008988 16.57008987 26.51214381 13.2560719-3.31401797 13.25607191-3.31401798z" fill="#1599FF" p-id="9713"></path></svg>
          </a>
          <a class="social-glass-btn" href="https://outlook.live.com/" target="_blank" title="Outlook">
              <img src="/src/assets/image/arcwater_logo.png" alt="" style="width: 40px;">
          </a>
        </div>
      </div>
      <a class="notice-card-demo-link" href="#" target="_blank" title="外部链接">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Material Icon Theme by Material Extensions - https://github.com/material-extensions/vscode-material-icon-theme/blob/main/LICENSE --><path fill="#20baff" d="M8.002 10.45A2.45 2.45 0 0 1 5.552 8a2.45 2.45 0 0 1 2.45-2.45A2.45 2.45 0 0 1 10.452 8a2.45 2.45 0 0 1-2.45 2.45m5.2-1.771c.029-.224.05-.448.05-.679a6 6 0 0 0-.05-.7l1.478-1.141a.35.35 0 0 0 .084-.448l-1.4-2.422a.344.344 0 0 0-.427-.154l-1.743.7a5 5 0 0 0-1.183-.686l-.26-1.855A.354.354 0 0 0 9.402 1h-2.8a.354.354 0 0 0-.35.294l-.258 1.855a5 5 0 0 0-1.183.686l-1.743-.7a.344.344 0 0 0-.427.154l-1.4 2.422a.345.345 0 0 0 .084.448L2.8 7.3a6 6 0 0 0-.05.7c0 .231.022.455.05.679L1.324 9.841a.345.345 0 0 0-.084.448l1.4 2.422c.084.154.273.21.427.154l1.743-.707c.364.28.742.518 1.183.693l.259 1.855a.354.354 0 0 0 .35.294h2.8a.354.354 0 0 0 .35-.294l.259-1.855a5 5 0 0 0 1.183-.693l1.743.707c.154.056.343 0 .427-.154l1.4-2.422a.35.35 0 0 0-.084-.448z"/></svg>
      </a>
    </div>
    <div class="notice-leave-message-section notice-leave-message-section-row">
      <div class="feedback-card">
        <div class="feedback-title">输入反馈</div>
        <div class="feedback-input-area">
          <textarea
            v-model="leaveInput"
            class="feedback-textarea"
            placeholder="Your feedback..."
            maxlength="120"
            rows="4"
          ></textarea>
        </div>
        <div class="feedback-actions">
          <div class="feedback-emojis">
            <button class="feedback-emoji-btn" title="开心" @click="selectEmoji('smile')">😊</button>
            <button class="feedback-emoji-btn" title="不开心" @click="selectEmoji('sad')">😞</button>
          </div>
          <button class="feedback-send-btn" :disabled="!leaveInput.trim()" @click="handleLeaveSubmit">
            <svg width="28" height="28" fill="none" stroke="#374151" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
          </button>
        </div>
      </div>
    
    </div>
  </div>

  

  <div class="notice-grid-section-pc-standalone">
    <h2 class="notice-grid-title-pc">更多服务</h2>
    <div class="notice-grid-pc-standalone">
      <div v-for="item in gridItems" :key="item.title" class="notice-grid-card-pc-standalone">
        <div class="notice-grid-icon-pc" v-html="item.icon"></div>
        <div class="notice-grid-content-pc">
          <div class="notice-grid-card-title-pc">{{ item.title }}</div>
          <div class="notice-grid-card-desc-pc">{{ item.desc }}</div>
        </div>
      </div>
    </div>
  </div>

  </div>
</template>

<script setup>
import { ref, computed, defineComponent, h } from 'vue'
import PurpleInput from '@/components/PurpleInput.vue'
// 可复用的搜索和过滤图标组件
const SearchIcon = defineComponent({
  name: 'SearchIcon',
  render() {
    return h('svg', {
      width: '22', height: '22', viewBox: '0 0 24 24', fill: 'none',
      class: 'dashboard-icon',
    }, [
      h('circle', { cx: 11, cy: 11, r: 7, stroke: 'currentColor', 'stroke-width': 2 }),
      h('path', { d: 'M20 20L17 17', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ])
  }
})
const FilterIcon = defineComponent({
  name: 'FilterIcon',
  render() {
    return h('svg', {
      width: '22', height: '22', viewBox: '0 0 24 24', fill: 'none',
      class: 'dashboard-icon',
    }, [
      h('path', { d: 'M4 7h16', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }),
      h('path', { d: 'M7 12h10', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }),
      h('path', { d: 'M10 17h4', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' })
    ])
  }
})
// 系统消息类型图标
const UpdateMajorIcon = defineComponent({
  name: 'UpdateMajorIcon',
  render() {
    return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '22', viewBox: '0 0 12 12', fill: 'none', class: 'sysmsg-icon' }, [
      h('path', { fill: '#e00e0e', d: 'M4.283 2.98a1.735 1.735 0 1 1 3.434 0l-.576 4.03a1.153 1.153 0 0 1-2.282 0zM7 10a1 1 0 1 1-2 0a1 1 0 0 1 2 0' })
    ])
  }
})
const UpdateMinorIcon = defineComponent({
  name: 'UpdateMinorIcon',
  render() {
    return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '22', viewBox: '0 0 24 24', fill: 'none', class: 'sysmsg-icon' }, [
      h('path', { fill: '#409EFF', d: 'M7.5 5.6L5 7l1.4-2.5L5 2l2.5 1.4L10 2L8.6 4.5L10 7zm12 9.8L22 14l-1.4 2.5L22 19l-2.5-1.4L17 19l1.4-2.5L17 14zM22 2l-1.4 2.5L22 7l-2.5-1.4L17 7l1.4-2.5L17 2l2.5 1.4zm-8.66 10.78l2.44-2.44l-2.12-2.12l-2.44 2.44zm1.03-5.49l2.34 2.34c.39.37.39 1.02 0 1.41L5.04 22.71c-.39.39-1.04.39-1.41 0l-2.34-2.34c-.39-.37-.39-1.02 0-1.41L12.96 7.29c.39-.39 1.04-.39 1.41 0' })
    ])
  }
})
const BugFixIcon = defineComponent({
  name: 'BugFixIcon',
  render() {
    return h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: '22', viewBox: '0 0 24 24', fill: 'none', class: 'sysmsg-icon' }, [
      h('path', { fill: '#21e208', d: 'M11.157 20.313a9.157 9.157 0 1 0 0-18.313a9.157 9.157 0 0 0 0 18.313', opacity: '.5' }),
      h('path', { fill: '#21e208', d: 'M17.1 18.122a9 9 0 0 0 1.022-1.022l3.666 3.666a.723.723 0 0 1-1.022 1.022z' }),
      h('path', { fill: '#21e208', 'fill-rule': 'evenodd', d: 'M11 6.5c-1.14 0-2.157.532-2.81 1.36l-.68-.338a.716.716 0 0 0-.958.318a.71.71 0 0 0 .319.953l.679.338a3.5 3.5 0 0 0-.121.922v.236h-.715A.71.71 0 0 0 6 11c0 .392.32.71.714.71h.715v.237q.001.48.12.922l-.678.338a.71.71 0 0 0-.32.953c.177.35.606.493.959.318l.68-.338A3.57 3.57 0 0 0 11 15.5c1.14 0 2.157-.532 2.81-1.36l.68.338a.716.716 0 0 0 .958-.318a.71.71 0 0 0-.319-.953l-.679-.338q.12-.442.121-.922v-.236h.715A.71.71 0 0 0 16 11c0-.392-.32-.71-.714-.71h-.715v-.237q-.002-.48-.12-.922l.678-.338a.71.71 0 0 0 .32-.953a.716.716 0 0 0-.959-.318l-.68.338A3.57 3.57 0 0 0 11 6.5m0 1.42c-.933 0-1.726.594-2.02 1.422h4.041a2.14 2.14 0 0 0-2.02-1.421m-2.143 4.027v-1.184h1.429v3.194a2.13 2.13 0 0 1-1.429-2.01m2.858 2.01v-3.194h1.428v1.184c0 .928-.596 1.718-1.428 2.01', 'clip-rule': 'evenodd' })
    ])
  }
})

const searchText = ref('')

// 仪表盘数据
const dashboardStats = [
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M.975 7q0-2.5 1.763-4.262T7 .974V3Q5.35 3 4.175 4.175T3 7zM5.3 18.725Q3.025 16.45 3.025 13.25T5.3 7.775L7.05 6l.3.3q.725.725.725 1.762T7.35 9.826l-.35.35q-.3.3-.3.713t.3.712l.9.9q.65.65.65 1.575T7.9 15.65l1.075 1.075q1.1-1.1 1.1-2.637T8.95 11.425l-.55-.55q.65-.65.925-1.463T9.55 7.75l4.475-4.475q.3-.3.713-.3t.712.3t.3.712t-.3.713l-4.675 4.675l1.05 1.05l6.025-6q.3-.3.7-.3t.7.3t.3.7t-.3.7l-6 6.025l1.05 1.05l5.3-5.3q.3-.3.713-.3t.712.3t.3.713t-.3.712l-5.3 5.3l1.05 1.05l4.05-4.05q.3-.3.713-.3t.712.3t.3.713t-.3.712l-6 5.975Q13.975 21 10.775 21T5.3 18.725m11.7 4.3V21q1.65 0 2.825-1.175T21 17h2.025q0 2.5-1.763 4.263T17 23.025"/></svg>` ,
    value: '1020',
    desc: 'New Group Invites',
    bg: '#cfe8ff',
    color: '#3c91e6',
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Tabler Icons by Paweł Kuna - https://github.com/tabler/tabler-icons/blob/master/LICENSE --><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0-4 0"/><path d="M15.03 17.478A8.8 8.8 0 0 1 12 18q-5.4 0-9-6q3.6-6 9-6t9 6a21 21 0 0 1-.258.419M19 16v3m0 3v.01"/></g></svg>`,
    value: '2834',
    desc: 'Visitors',
    bg: '#fff2c6',
    color: '#ffce26',
  },
  {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE --><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m3 8h-4v1h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1h-2v-1H9v-2h4v-1h-3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1V7h2v1h2z" fill="currentColor"/></svg>`,
    value: '$2543.00',
    desc: 'Total Arcorns',
    bg: '#ffe0d3',
    color: '#fd7238',
  },
]

// 最近群聊邀请
const groupInvites = ref([
  { inviter: 'Micheal John', group: 'Vue Devs', date: '18-10-2021', status: 'Accepted', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Ryan Doe', group: 'Frontend Masters', date: '01-06-2022', status: 'Pending', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Tarry White', group: 'Design Team', date: '14-10-2021', status: 'Declined', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Selma', group: 'AI Enthusiasts', date: '01-02-2023', status: 'Pending', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Andreas Doe', group: 'Open Source', date: '31-10-2021', status: 'Accepted', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Jane Smith', group: 'UI/UX', date: '05-03-2022', status: 'Accepted', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Tom Lee', group: 'Backend Pros', date: '12-07-2022', status: 'Pending', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Anna Kim', group: 'ML Club', date: '22-08-2022', status: 'Declined', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Chris Paul', group: 'React China', date: '10-09-2022', status: 'Accepted', avatar: 'https://placehold.co/600x400/png' },
  { inviter: 'Linda Green', group: 'Cloud Native', date: '15-10-2022', status: 'Pending', avatar: 'https://placehold.co/600x400/png' },
])
const groupInvitePage = ref(1)
const groupInvitePageSize = 5
const pagedGroupInvites = computed(() => {
  const start = (groupInvitePage.value - 1) * groupInvitePageSize
  return groupInvites.value.slice(start, start + groupInvitePageSize)
})
function handleGroupInvitePageChange(val) {
  groupInvitePage.value = val
}

// 系统消息
const sysMessages = [
  { text: 'Platform v2.0 Major Update Released', type: 'major' },
  { text: 'Added new notification center', type: 'minor' },
  { text: 'Fixed group invite bug', type: 'bugfix' },
  { text: 'UI overhaul for dashboard', type: 'major' },
  { text: 'Improved performance', type: 'minor' },
  { text: 'Fixed login issue', type: 'bugfix' },
]
function getSysMsgIcon(type) {
  if (type === 'major') return UpdateMajorIcon
  if (type === 'minor') return UpdateMinorIcon
  if (type === 'bugfix') return BugFixIcon
  return null
}


// 留言板块逻辑
const leaveInput = ref('')
const leaveMessages = ref([])
function handleLeaveSubmit() {
  if (leaveInput.value.trim()) {
    leaveMessages.value.unshift(leaveInput.value.trim())
    leaveInput.value = ''
  }
}

function selectEmoji(type) {
  if (type === 'smile') leaveInput.value += '😊'
  if (type === 'sad') leaveInput.value += '😞'
}

// More Services 区块模拟数据
const gridItems = [
  {
    title: '网站资源',
    desc: '查看实用网站、工具资源汇总',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 -1 24 24"><!-- Icon from Jam Icons by Michael Amprimo - https://github.com/cyberalien/jam-backup/blob/main/LICENSE --><path fill="currentColor" d="m2 8.654l2.813 2.822l6.332-6.35l-2.814-2.823l-6.332 6.35zm4.441 8.128l2.11-2.117a.993.993 0 0 1 1.408 0a1 1 0 0 1 0 1.411l-2.11 2.117a1 1 0 0 1 0 1.411L6.44 21.015a.993.993 0 0 1-1.407 0l-1.407-1.41a1 1 0 0 1 0-1.412l1.407-1.411a.993.993 0 0 1 1.407 0zm9.146-6.35l6.331-6.35l-1.407-1.412l-6.331 6.35c-.777-.78-.912-1.907-.302-2.52L19.406.956c.61-.612 1.735-.477 2.512.303l1.407 1.41c.778.78.913 1.909.302 2.52l-5.528 5.545c-.61.612-1.735.477-2.512-.303zm-.924 3.866L9.738 9.36l-.704.706l4.925 4.939zm1.407 1.412l-.704.705l1.759 1.764c.194.195.51.195.703 0a.5.5 0 0 0 0-.705zM2.06 5.77a1.5 1.5 0 0 1 .291-1.704l1.407-1.41a1.49 1.49 0 0 1 1.699-.293L6.924.892a1.986 1.986 0 0 1 2.814 0l2.814 2.823a2 2 0 0 1 0 2.822l-1.407 1.411l8.09 8.114a2.5 2.5 0 0 1 0 3.528a2.48 2.48 0 0 1-3.517 0l-8.09-8.114l-1.408 1.411c-.777.78-2.037.78-2.814 0L.592 10.065a2 2 0 0 1 0-2.823l1.467-1.47z"/></svg>`
  },
  {
    title: '游戏中心',
    desc: '游玩小游戏赚取积分、经验值。',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Lucide by Lucide Contributors - https://github.com/lucide-icons/lucide/blob/main/LICENSE --><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 11h4M8 9v4m7-1h.01M18 10h.01m-.69-5H6.68a4 4 0 0 0-3.978 3.59l-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258q-.01-.075-.017-.151A4 4 0 0 0 17.32 5"/></svg>`
  },
  {
    title: '更多AI应用',
    desc: '汇集各种效率AI工具',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from MingCute Icon by MingCute Design - https://github.com/Richard9394/MingCute/blob/main/LICENSE --><g fill="none" fill-rule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M20 14v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5zM12 3c1.33 0 2.584.324 3.687.899l.606-.606a1 1 0 1 1 1.414 1.414l-.35.35A7.98 7.98 0 0 1 20 11v1H4v-1a7.98 7.98 0 0 1 2.644-5.942l-.351-.35a1 1 0 0 1 1.414-1.415l.606.606A8 8 0 0 1 12 3M9 7a1 1 0 1 0 0 2a1 1 0 0 0 0-2m6 0a1 1 0 1 0 0 2a1 1 0 0 0 0-2"/></g></svg>`
  },
  {
    title: '意见反馈',
    desc: '如有任何建议，欢迎随时联系我。',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Design Icons by Pictogrammers - https://github.com/Templarian/MaterialDesign/blob/master/LICENSE --><path fill="currentColor" d="M9 22c-.55 0-1-.45-1-1v-3H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12c0 1.11-.89 2-2 2h-6.1l-3.7 3.71c-.2.19-.45.29-.7.29zm1-6v3.08L13.08 16H20V4H4v12zm5.84-7.8l-1.01 1.01l-2.07-2.03l1.01-1.02c.2-.21.54-.22.78 0l1.29 1.25c.21.21.22.55 0 .79M8 11.91l4.17-4.19l2.07 2.08l-4.16 4.2H8z"/></svg>`
  },
]
</script>

<style scoped>




.notice-center-glass-pc {
  max-width: 1300px;
  margin: 48px auto 0 auto;
  padding: 32px 36px 32px 36px;
  /* 取消背景、阴影、圆角 */
  background: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  border: none !important;
  font-family: 'San Francisco', 'SF Pro Display', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  position: relative;
}
.dark-mode .notice-center-glass-pc {
  background: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  border: none !important;
}
.notice-center-header-pc {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
}
.notice-title-pc {
  font-size: 2.1rem;
  font-weight: 800;
  letter-spacing: 1.2px;
  color: #1a233a;
  margin-bottom: 0;
  background: linear-gradient(90deg, #2253a7 0%, #409eff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.dark-mode .notice-title-pc {
  background: linear-gradient(90deg, #eaf6ff 0%, #90c4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.notice-tabs-pc {
  display: flex;
  gap: 12px;
  margin-bottom: 0;
}
.notice-tab-pc {
  background: none;
  border: none;
  font-size: 1.08rem;
  font-weight: 600;
  color: #2253a7;
  padding: 6px 18px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
}
.notice-tab-pc.active {
  background: linear-gradient(90deg, #a2bdeb 0%, #6caae9 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.10);
  backdrop-filter: blur(12px) saturate(160%);
  background-color: rgba(34, 83, 167, 0.18);
}
.dark-mode .notice-tab-pc {
  color: #ffffff;
}


.notice-search-input {
  width: 100%;
  --el-input-bg-color: rgba(255,255,255,0.95);
  --el-input-border-radius: 12px;
  --el-input-border-color: #dbeafe;
  --el-input-hover-border-color: #409eff;
  --el-input-focus-border-color: #409eff;
  --el-input-placeholder-color: #b0b8c9;
}
.notice-list-pc {
  
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 520px;
  min-height: 320px;  overflow-y: auto;
}
.notice-card-pc {
  width: 95%;
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  background: rgba(255,255,255,0.38); /* 高透明毛玻璃 */
  border-radius: 18px;
  box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.10), 0 1.5px 6px 0 rgba(64, 158, 255, 0.08);
  padding: 14px 18px 12px 14px;
  position: relative;
  transition: box-shadow 0.18s, background 0.18s, border 0.18s, transform 0.18s;
  border: 1.5px solid rgba(180,200,255,0.10);
  min-height: 44px;
  font-size: 15px;
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  margin-bottom: 6px;
}
.notice-card-pc:hover {
  background: rgba(255,255,255,0.55);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.16), 0 2px 12px 0 rgba(64, 158, 255, 0.13);
  transform: translateY(-2px) scale(1.01);
}
.notice-card-pc.unread {
  border-color: #409eff;
  background: linear-gradient(90deg, rgba(234,246,255,0.55) 0%, rgba(245,250,255,0.55) 100%);
}
.dark-mode .notice-card-pc {
  background: rgba(24,36,64,0.38);
  border: 1.5px solid rgba(80,120,200,0.18);
  box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.18), 0 1.5px 6px 0 rgba(64, 158, 255, 0.10);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
}
.dark-mode .notice-card-pc.unread {
  background: linear-gradient(90deg, rgba(26,35,58,0.55) 0%, rgba(34,83,167,0.55) 100%);
  border-color: #90c4ff;
}
.notice-avatar-pc {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  overflow: hidden;
  margin-right: 8px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(64, 158, 255, 0.06);
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notice-avatar-pc img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}
.notice-content-pc {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.notice-header-pc {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
}
.notice-title-main-pc {
  font-size: 0.97rem;
  font-weight: 600;
  color: #1a233a;
  letter-spacing: 0.1px;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dark-mode .notice-title-main-pc {
  color: #eaf6ff;
}
.notice-time-pc {
  font-size: 0.93rem;
  color: #90a4ae;
  font-weight: 400;
  margin-left: 8px;
  flex-shrink: 0;
}
.notice-desc-pc {
  font-size: 0.93rem;
  color: #4f5353;
  font-weight: 400;
  line-height: 1.4;
  word-break: break-word;
  opacity: 0.92;
}
.dark-mode .notice-desc-pc {
  color: #b0c4de;
}
.notice-unread-dot-pc {
  position: absolute;
  right: 10px;
  top: 12px;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #ff4e6a 0%, #e00d3a 100%);
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(224, 13, 58, 0.10);
  border: 2px solid #fff;
  z-index: 2;
  animation: unread-dot-pulse 1.2s infinite alternate;
}
@keyframes unread-dot-pulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.18); opacity: 0.7; }
}
.notice-empty-pc {
  margin-top: 48px;
  text-align: center;
  opacity: 0.7;
}
.notice-pagination-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 18px 0 18px 0;
  padding: 12px 0;
  border-radius: 18px;

  width: 96%;
  margin-left: auto;
  margin-right: auto;
}
:deep(.el-pagination) {
  --el-pagination-bg-color: transparent;
  --el-pagination-border-radius: 10px;
  --el-pagination-font-size: 1.08rem;
}
.dark-mode .el-pagination {
  background:none !important; 
}

:deep(.el-pagination button) {
  background:none !important; 
  color: #244775 !important;
}

.notice-grid-section-pc {
  margin-top: 38px;
}
.notice-grid-title-pc {
  font-size: 1.13rem;
  font-weight: 700;
  color: #2253a7;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, #2253a7 0%, #409eff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.dark-mode .notice-grid-title-pc {
  background: linear-gradient(90deg, #eaf6ff 0%, #90c4ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.notice-grid-pc {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
.notice-grid-card-pc {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(255,255,255,0.98);
  border-radius: 10px;
  box-shadow: 0 1px 6px 0 rgba(64, 158, 255, 0.06);
  padding: 14px 14px 12px 14px;
  border: 1px solid rgba(180,200,255,0.10);
  min-height: 56px;
  transition: box-shadow 0.15s, background 0.15s, border 0.15s;
  cursor: pointer;
}
.notice-grid-card-pc:hover {
  box-shadow: 0 4px 16px 0 rgba(64, 158, 255, 0.13);
  border-color: #409eff;
  background: rgba(240,250,255,0.98);
}
.dark-mode .notice-grid-card-pc {
  background: linear-gradient(120deg, rgba(24,36,64,0.92) 60%, rgba(60,80,120,0.38) 100%);
  border: 1.5px solid rgba(80,120,200,0.22);
}
.dark-mode .notice-grid-card-pc:hover {
  background: linear-gradient(90deg, #1a233a 0%, #2253a7 100%);
  border-color: #90c4ff;
}
.notice-grid-icon-pc {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.notice-grid-content-pc {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.notice-grid-card-title-pc {
  font-size: 1rem;
  font-weight: 600;
  color: #1a233a;
  margin-bottom: 1px;
}
.dark-mode .notice-grid-card-title-pc {
  color: #eaf6ff;
}
.notice-grid-card-desc-pc {
  font-size: 0.97rem;
  color: #4f5353;
  font-weight: 400;
  line-height: 1.5;
  opacity: 0.92;
}
.dark-mode .notice-grid-card-desc-pc {
  color: #b0c4de;
}
/* 独立的更多服务容器 */
.notice-grid-section-pc-standalone {
  margin: 38px auto 0 auto;
  padding:36px;
  margin-bottom: 38px;
}
.notice-grid-pc-standalone {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  background: none;
  box-shadow: none;
  border-radius: 0;
}
.notice-grid-card-pc-standalone {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(130, 148, 247, 0.32);
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(31, 38, 135, 0.08);
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  padding: 14px 14px 12px 14px;
  border: 1.5px solid rgba(180,200,255,0.10);
  min-height: 56px;
  transition: box-shadow 0.15s, background 0.15s, border 0.15s, transform 0.15s;
  cursor: pointer;
}
.notice-grid-card-pc-standalone:hover {
  background: rgba(255,255,255,0.48);
  box-shadow: 0 4px 18px 0 rgba(31, 38, 135, 0.13);
  transform: translateY(-2px) scale(1.03);
}

.notice-leave-title {
  font-size: 1.13rem;
  font-weight: 700;
  color: #2253a7;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
  background: linear-gradient(90deg, #2253a7 0%, #409eff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.notice-leave-form {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 12px;
}
.notice-leave-input {
  flex: 1;
  min-width: 0;
}
.notice-leave-btn {
  height: 36px;
  font-size: 15px;
  border-radius: 8px;
}
.notice-leave-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}
.notice-leave-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #333;
  padding: 0;
}
.notice-leave-avatar {
  font-size: 18px;
  margin-top: 1px;
}
.notice-leave-content {
  word-break: break-all;
  flex: 1;
}
.notice-leave-empty {
  color: #aaa;
  font-size: 13px;
  padding: 8px 0;
}
.notice-leave-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10%;
  padding: 0 36px 18px 36px;
  box-sizing: border-box;
}
.notice-card-demo {
  background: linear-gradient(135deg, #e8eff7cc 0%, #dbeafecc 100%);
  border-radius: 16px;
  box-shadow: 0 4px 18px 0 rgba(31, 38, 135, 0.10);
  padding: 28px 24px 24px 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 320px;
  max-width: 340px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.25);
}
.dark-mode .notice-card-demo {
  background: #23263a;
  box-shadow: 0 20px 20px 0 #00000033 inset !important;
  border: none !important;
}
.notice-card-demo-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: #29497a;
  margin-bottom: 14px;
}
.dark-mode .notice-card-demo-title {
  color: #fcfaf8;
}
.notice-card-demo-desc {
  font-size: 1.08rem;
  color: #374151;
  margin-bottom: 32px;
  line-height: 1.6;
}
.notice-card-demo-link {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 8px;
  transition: background 0.18s;
  text-decoration: none;
}
.notice-card-demo-link:hover {
  background: #d1d5db;
}
.notice-leave-message-section-row {
  flex: 1 1 0%;
  box-shadow: none;
  border-radius: 0;
}
.feedback-card {
  background: linear-gradient(135deg, #f6fafd 0%, #e9f0fa 100%);
  border-radius: 18px;
  box-shadow: 0 4px 18px 0 rgba(31, 38, 135, 0.10);
  padding: 38px;
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
.dark-mode .feedback-card {
  background: #23263a;
  box-shadow: 0 20px 20px 0 #00000033 inset !important;
  border: none !important;
}
.feedback-title {
  font-size: 1.55rem;
  font-weight: 700;
  color: #29497a;
  text-align: center;
  margin-bottom: 16px;
  letter-spacing: 1px;
  opacity: 0.95;
}
.dark-mode .feedback-title {
  color: #fafbff;
}
.feedback-input-area {
  width: 100%;
  margin-bottom: 14px;
}

.feedback-textarea {
  width: 100%;
  min-height: 80px;
  border-radius: 10px;
  border: 0;
  background: #f3f7fb;
  font-size: 1.18rem;
  color: #374151;
  padding: 12px 14px;
  resize: none;
  outline: none;
  transition: border 0.18s;
  box-sizing: border-box;
  box-shadow: 0 2px 8px 0 #e0e7ef inset;
}
.dark-mode .feedback-textarea {
  background: #23263a;
  box-shadow: 0 2px 8px 0 #00000033 inset !important;
  color: #fff;
}


.feedback-actions {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
}
.feedback-emojis {
  display: flex;
  gap: 8px;
}
.feedback-emoji-btn {
  background: #f3f7fb;
  border: none;
  border-radius: 8px;
  width: 38px;
  height: 38px;
  font-size: 1.35rem;
  cursor: pointer;
  transition: background 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.feedback-emoji-btn:hover {
  background: #e0e7ef;
}
.feedback-send-btn {
  background: #f3f7fb;
  border: none;
  border-radius: 10px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s;
  font-size: 1.3rem;
}
.feedback-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.feedback-send-btn:hover:not(:disabled) {
  background: #e0e7ef;
}

/* 社交玻璃片样式 */
.social-glass-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 22px;
  margin-bottom: 18px;
  justify-items: center;
  align-items: center;
}
@media (max-width: 900px) {
  .social-glass-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 600px) {
  .social-glass-row {
    grid-template-columns: 1fr;
  }
}
.social-glass-btn {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(255,255,255,0.28);
  box-shadow: 0 2px 12px 0 #1f268714;
  backdrop-filter: blur(10px) saturate(180%);
  -webkit-backdrop-filter: blur(10px) saturate(180%);
  border: 1.5px solid rgba(180,200,255,0.13);
  transition: box-shadow 0.18s, background 0.18s, transform 0.18s;
  cursor: pointer;
}
.social-glass-btn:hover {
  background: rgba(255,255,255,0.45);
  box-shadow: 0 4px 18px 0 #1f26872a;
  transform: translateY(-2px) scale(1.06);
}

.dashboard-section {
  margin: 40px auto 0 auto;
  max-width: 1300px;
  background: none;
  border-radius: 18px;
  padding: 0 0 32px 0;
}
.dashboard-cards {
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
}
.dashboard-card {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px 32px;
  box-shadow: 0 2px 8px #0001;
  min-width: 200px;
  transition: background 0.3s;
}
.dark-mode .dashboard-card {
  background: #23263a;
  box-shadow: 0 2px 8px #0003;
}
.dashboard-card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}
.dashboard-card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dashboard-card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #342e37;
  transition: color 0.3s;
}
.dark-mode .dashboard-card-title {
  color: #fff;
}
.dashboard-card-desc {
  color: #aaa;
  font-size: 1rem;
  transition: color 0.3s;
}
.dark-mode .dashboard-card-desc {
  color: #ccc;
}
.dashboard-main {
  display: flex;
  gap: 24px;
}
.dashboard-group-invites {
  flex: 1.5;
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 2px 8px #0001;
  min-width: 320px;
  transition: background 0.3s;
}
.dashboard-sysmsgs {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 2px 8px #0001;
  min-width: 320px;
  transition: background 0.3s;
}
.dark-mode .dashboard-group-invites {
  background: #23263a;
  box-shadow: 0 2px 8px #0003;
}
.dark-mode .dashboard-sysmsgs {
  background: #23263a;
  box-shadow: 0 2px 8px #0003;
}
.dashboard-section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 18px;
  color: #342e37;
  transition: color 0.3s;
}
.dark-mode .dashboard-section-title {
  color: #fff;
}
.dashboard-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 1rem;
}
.dashboard-table th, .dashboard-table td {
  padding: 12px 0;
  text-align: left;
}
.dashboard-table th {
  color: #aaa;
  font-weight: 500;
  border-bottom: 1px solid #eee;
  transition: color 0.3s, border-color 0.3s;
}
.dark-mode .dashboard-table th {
  color: #bbb;
  border-bottom: 1px solid #333;
}
.dashboard-table td {
  color: rgb(14, 14, 14);
}
.dark-mode .dashboard-table td {
  color: #fff;
}
.dashboard-table td img.dashboard-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
  vertical-align: middle;
}
.dashboard-status {
  display: inline-block;
  padding: 6px 18px;
  border-radius: 16px;
  font-size: 0.95em;
  font-weight: 600;
  color: #fff;
}
.dashboard-status.accepted {
  background: #3c91e6;
}
.dashboard-status.pending { 
  background: #ff7626;
}
.dashboard-status.declined {
  background: #f50909;
  color: #f4f4f5;
}

.dashboard-todo-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.dashboard-todo-list li {
  display: flex;
  align-items: center;
  background: #f4f6fa;
  border-radius: 10px;
  padding: 12px 0;
  font-size: 1rem;
  gap: 12px;
  position: relative;
  transition: background 0.3s;
  font-weight: 600;
}
.dark-mode .dashboard-todo-list li {
  background: #181a20;
}



.dashboard-section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.dashboard-section-icons {
  display: flex;
  align-items: center;
  gap: 18px;
}
.dashboard-section-icons .dashboard-icon {
  display: inline-block;
  vertical-align: middle;
  cursor: pointer;
  transition: filter 0.2s;
  color: #222;
}
.dark-mode .dashboard-section-icons .dashboard-icon {
  color: #fff;
}
.dashboard-section-icons .dashboard-icon:hover {
  filter: brightness(0.7);
}


.sysmsg-icon {
  vertical-align: middle;
}

/* 响应式布局 */
@media (max-width: 1100px) {
  .dashboard-cards {
    flex-direction: column;
    gap: 18px;
  }
  .dashboard-main {
    flex-direction: column;
    gap: 18px;
  }
  .dashboard-group-invites, .dashboard-sysmsgs {
    min-width: 0;
    width: 100%;
    margin-bottom: 18px;
  }
}
@media (max-width: 900px) {
  .notice-center-glass-pc {
    padding: 18px 8px 18px 8px;
  }
  .dashboard-section {
    padding: 0 0 18px 0;
  }
  .dashboard-cards {
    gap: 12px;
  }
  .dashboard-group-invites, .dashboard-sysmsgs {
    padding: 12px;
  }
  .notice-leave-row {
    flex-direction: column;
    gap: 18px;
    padding: 0 8px 12px 8px;
  }
  .notice-card-demo {
    max-width: 100%;
    min-width: 0;
    width: 100%;
  }
  .feedback-card {
    padding: 18px;
  }
  .notice-grid-section-pc-standalone {
    padding: 12px;
  }
  .notice-grid-pc-standalone {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
@media (max-width: 600px) {
  .dashboard-cards {
    flex-direction: column;
    gap: 10px;
  }
  .dashboard-main {
    flex-direction: column;
    gap: 10px;
  }
  .dashboard-group-invites, .dashboard-sysmsgs {
    padding: 8px;
    min-width: 0;
    width: 100%;
  }
  .dashboard-section {
    padding: 0 0 8px 0;
  }
  .notice-leave-row {
    flex-direction: column;
    gap: 10px;
    padding: 0 4px 8px 4px;
  }
  .notice-card-demo {
    padding: 12px 8px 12px 8px;
    max-width: 100%;
    min-width: 0;
    width: 100%;
  }
  .feedback-card {
    padding: 8px;
  }
  .notice-grid-section-pc-standalone {
    padding: 4px;
  }
  .notice-grid-pc-standalone {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

/* 仪表盘卡片 hover 效果 */
.dashboard-card {
  cursor: pointer;
  transition: box-shadow 0.18s, background 0.18s, transform 0.18s;
}
.dashboard-card:hover {
  background: #f4f8ff;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.13);
  transform: translateY(-2px) scale(1.03);
}
.dark-mode .dashboard-card:hover {
  background: #2a2e4a;
}

/* 群聊邀请表格行 hover 效果 */
.dashboard-table tbody tr {
  transition: background 0.18s;
  cursor: pointer;
}
.dashboard-table tbody tr:hover {
  background: #f4f8ff;
}
.dark-mode .dashboard-table tbody tr:hover {
  background: #23263a;
}

/* 系统消息 hover 效果 */
.dashboard-todo-list li {
  transition: background 0.18s, box-shadow 0.18s, transform 0.18s;
  cursor: pointer;
}
.dashboard-todo-list li:hover {
  background: #eaf2ff;
  box-shadow: 0 2px 8px 0 #409eff22;
  transform: translateY(-1px) scale(1.01);
}
.dark-mode .dashboard-todo-list li:hover {
  background: #23263a;
}

/* 更多服务卡片 hover 效果 */
.notice-grid-card-pc-standalone {
  transition: box-shadow 0.18s, background 0.18s, transform 0.18s;
  cursor: pointer;
}
.notice-grid-card-pc-standalone:hover {
  background: #f4f8ff;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.13);
  transform: translateY(-2px) scale(1.03);
}
.dark-mode .notice-grid-card-pc-standalone:hover {
  background: #23263a;
}

</style>


