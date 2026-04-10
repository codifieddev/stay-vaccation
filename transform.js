const fs = require('fs');
let code = fs.readFileSync('app/components/AdminPanel.tsx', 'utf8');

code = code.replace('const StoreContext =', 'export const StoreContext =');
code = code.replace('const useStore =', 'export const useStore =');

const components = ['Dashboard', 'PackagesListing', 'PackageForm', 'ViewPackage', 'MasterActivitiesPage', 'MasterHotelsPage', 'CouponsPage', 'BookingsPage', 'TransfersPage', 'Sidebar', 'Topbar', 'DuplicatePackageModal', 'ImageUploader'];
components.forEach(c => {
  code = code.replace(new RegExp('const ' + c + ' = ', 'g'), 'export const ' + c + ' = ');
});

code = code.replace('export default function App() {', 'export const AdminStateProvider = ({ children }: { children: React.ReactNode }) => {');

const replaceFrom = '<StoreContext.Provider value={store}>';
const returnIndex = code.indexOf(replaceFrom);
if (returnIndex !== -1) {
  const start = code.substring(0, returnIndex);
  const end = `    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
};
`;
  code = start + end;
}

fs.writeFileSync('app/components/AdminCore.tsx', code);
console.log('AdminCore.tsx created');
