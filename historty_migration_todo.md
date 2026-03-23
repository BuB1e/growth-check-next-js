# Tasks
I need you to planning on these task
- All topic need to use their own DTO, API, Actions

## Page /desktop/user-request
- using /actions/UserCreateStatusAction.ts
- using /dto/UserCreateStatusDto.ts

## Page /desktop/request
- using /actions/LocationCreateRequestAction.ts
- using /actions/ChildTransferRequestAction.ts
- using /dto/LocationCreateRequestDto.ts
- using /dto/ChildTransferRequestDto.ts

## Page /desktop/history
- first approach we need this page because we merge /desktop/user-request and /desktop/request into one page.
- but now we have /desktop/user-request and /desktop/request already, so we remove this page.
- so we have to remove
	- /app/desktop/history/*
	- /actions/HistoryAction.ts
	- /dto/HistoryDto.ts
