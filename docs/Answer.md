

﻿
ManagerDashboardPage.tsx:164 ダッシュボードデータ取得エラー: TypeError: Cannot read properties of undefined (reading 'forEach')
    at y (ManagerDashboardPage.tsx:183:39)
    at ManagerDashboardPage.tsx:158:9
auth.service.js:105 
 GET https://hairmanagement-backend-235426778039.asia-northeast1.run.app/api/v1/auth/me 404 (Not Found)
api.utils.ts:136 
 GET https://hairmanagement-backend-235426778039.asia-northeast1.run.app/api/v1/fortune/range?startDate=2025-03-27&endDate=2025-04-02 404 (Not Found)
fortune.service.ts:75 運勢範囲データ取得エラー: 
$ {message: 'Request failed with status code 404', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
FortuneContext.tsx:76 週間運勢取得エラー: 
$ {message: 'Request failed with status code 404', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
auth.service.js:77 
 POST https://hairmanagement-backend-235426778039.asia-northeast1.run.app/api/v1/auth/refresh-token 404 (Not Found)


auth.service.js:47 
 POST https://hairmanagement-backend-235426778039.asia-northeast1.run.app/api/v1/auth/logout 404 (Not Found)
auth.service.js:61 Logout error: Error: リソースが見つかりません
    at Object.logout (auth.service.js:58:15)
    at async o (AuthContext.js:113:5)
    at async c (AuthContext.js:154:7)
    at async AuthContext.js:45:13
auth.service.js:47 
 POST https://hairmanagement-backend-235426778039.asia-northeast1.run.app/api/v1/auth/logout 404 (Not Found)
auth.service.js:61 Logout error: Error: リソースが見つかりません
    at Object.logout (auth.service.js:58:15)
    at async o (AuthContext.js:113:5)
    at async AuthContext.js:47:22
ManagerDashboardPage.tsx:164 ダッシュボードデータ取得エラー: TypeError: Cannot read properties of undefined (reading 'forEach')
    at y (ManagerDashboardPage.tsx:183:39)
    at ManagerDashboardPage.tsx:158:9
api.utils.ts:136 
 GET https://hairmanagement-backend-235426778039.asia-northeast1.run.app/api/v1/fortune/range?startDate=2025-03-27&endDate=2025-04-02 404 (Not Found)
fortune.service.ts:75 運勢範囲データ取得エラー: 
$ {message: 'Request failed with status code 404', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
FortuneContext.tsx:76 週間運勢取得エラー: 
$ {message: 'Request failed with status code 404', name: 'AxiosError', code: 'ERR_BAD_REQUEST', config: {…}, request: XMLHttpRequest, …}
conversation.service.ts:166 
 POST https://hairmanagement-backend-235426778039.asia-northeast1.run.app/api/v1/conversation/generate-prompt 404 (Not Found)
useConversation.ts:121 呼び水質問生成エラー: Error: リソースが見つかりません
    at Object.generatePromptQuestion (conversation.service.ts:178:13)
    at async useConversation.ts:119:7
    at async A (PromptQuestion.tsx:81:13)
useConversation.ts:13 [Toast] error: 呼び水質問の生成に失敗しました
PromptQuestion.tsx:93 質問生成エラー: Error: リソースが見つかりません
    at Object.generatePromptQuestion (conversation.service.ts:178:13)
    at async useConversation.ts:119:7
    at async A (PromptQuestion.tsx:81:13)
conversation.service.ts:111 
 GET https://hairmanagement-backend-235426778039.asia-northeast1.run.app/api/v1/conversation?page=1&limit=10&archived=false 404 (Not Found)
useConversation.ts:88 会話履歴取得エラー: Error: リソースが見つかりません
    at Object.getAllConversations (conversation.service.ts:121:13)
    at async useConversation.ts:83:13
useConversation.ts:13 [Toast] error: 会話履歴の取得に失敗しました
﻿



Request URL:
https://hairmanagement-backend-235426778039.asia-northeast1.run.app/api/v1/conversation/generate-prompt
Request Method:
POST
Status Code:
404 Not Found (from service worker)
Referrer Policy:
strict-origin-when-cross-origin
access-control-allow-credentials:
true
access-control-allow-origin:
https://dailyfortune-app.web.app
alt-svc:
h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length:
112
content-type:
application/json; charset=utf-8
date:
Thu, 27 Mar 2025 22:55:21 GMT
etag:
W/"70-mVEVtBGVQNZ5r7xRune8czutBC8"
server:
Google Frontend
vary:
Origin
x-cloud-trace-context:
a9f7c229a30eca17d74828c98029a4d9
x-powered-by:
Express
authorization:
Bearer dummy-jwt-token
content-type:
application/json
referer:
https://dailyfortune-app.web.app/
sec-ch-ua:
"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"
sec-ch-ua-mobile:
?0
sec-ch-ua-platform:
"macOS"
user-agent:
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36

Request URL:
https://hairmanagement-backend-235426778039.asia-northeast1.run.app/api/v1/conversation?page=1&limit=10&archived=false
Request Method:
GET
Status Code:
404 Not Found (from service worker)
Referrer Policy:
strict-origin-when-cross-origin
access-control-allow-credentials:
true
access-control-allow-origin:
https://dailyfortune-app.web.app
alt-svc:
h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length:
96
content-type:
application/json; charset=utf-8
date:
Thu, 27 Mar 2025 22:55:21 GMT
etag:
W/"60-bYvBOWFIzQJ9xDG/lWl5iX50ej0"
server:
Google Frontend
vary:
Origin
x-cloud-trace-context:
30dc4c7202917daed74828c98029aa9e
x-powered-by:
Express
authorization:
Bearer dummy-jwt-token
referer:
https://dailyfortune-app.web.app/
sec-ch-ua:
"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"
sec-ch-ua-mobile:
?0
sec-ch-ua-platform:
"macOS"
user-agent:
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36
equest URL:
https://hairmanagement-backend-235426778039.asia-northeast1.run.app/api/v1/conversation/generate-prompt
Request Method:
POST
Status Code:
404 Not Found
Remote Address:
216.239.32.53:443
Referrer Policy:
strict-origin-when-cross-origin
access-control-allow-credentials:
true
access-control-allow-origin:
https://dailyfortune-app.web.app
alt-svc:
h3=":443"; ma=2592000,h3-29=":443"; ma=2592000
content-length:
112
content-type:
application/json; charset=utf-8
date:
Thu, 27 Mar 2025 22:55:21 GMT
etag:
W/"70-mVEVtBGVQNZ5r7xRune8czutBC8"
server:
Google Frontend
vary:
Origin
x-cloud-trace-context:
a9f7c229a30eca17d74828c98029a4d9
x-powered-by:
Express
:authority:
hairmanagement-backend-235426778039.asia-northeast1.run.app
:method:
POST
:path:
/api/v1/conversation/generate-prompt
:scheme:
https
accept:
*/*
accept-encoding:
gzip, deflate, br, zstd
accept-language:
ja
authorization:
Bearer dummy-jwt-token
content-length:
30
content-type:
application/json
origin:
https://dailyfortune-app.web.app
priority:
u=1, i
referer:
https://dailyfortune-app.web.app/
sec-ch-ua:
"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"
sec-ch-ua-mobile:
?0
sec-ch-ua-platform:
"macOS"
sec-fetch-dest:
empty
sec-fetch-mode:
cors
sec-fetch-site:
cross-site
sec-fetch-storage-access:
none
user-agent:
Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36
