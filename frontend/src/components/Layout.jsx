import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className='flex h-screen flex-col bg-neutral-950 text-neutral-100'>
      <Navbar />
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar />
        <main className='flex-1 overflow-y-auto bg-neutral-950'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
