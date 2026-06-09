React Day-1
* Create New project:- 
npm create vite@latest digital-app --template react-ts
	Need to install the following packages:
	create-vite@9.0.6
	Ok to proceed? (y) y

	> npx
	> create-vite digital-app react-ts
	
	│
	◇  Select a framework:
	│  React
	│
	◇  Select a variant:
	│  TypeScript
	│
	◇  Install with npm and start now?
	│  Yes
	│
	◇  Scaffolding project in C:\Users\273803\Desktop\Digital Banking Platform\digital-app...
	│
	◇  Installing dependencies with npm...
	
* App Folder Structure:-

In React (with Vite), it’s Execution Flow:
index.html
   ↓
main.tsx
   ↓
App.tsx (or Router)
   ↓
Your Components

src/
 ├── app/                # app-level config (routing, providers)
 ├── features/           # domain-based modules
 │    ├── auth/
 │    ├── dashboard/
 ├── shared/             # reusable components
 ├── hooks/              # custom hooks
 ├── services/           # API layer
 ├── types/              # global types
 ├── utils/              # helpers

* Naming convention:
1. React Components → PascalCase (STANDARD)
2. Hooks → camelCase starting with “use” (MANDATORY)
3. Utility Files → camelCase
4. Services → camelCase
5. Types → PascalCase for type names
6. Folders → lowercase (mostly)






















	