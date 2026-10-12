import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

function CargandoPagina() {
  return (
    <div className='flex h-full items-center justify-center'>
      <i className='ti ti-loader-2 animate-spin text-2xl text-pink-500' />
    </div>
  );
}

export default function Layout() {
  return (
    <div className='flex h-screen flex-col bg-neutral-950 text-neutral-100'>
      <Navbar />
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar />
        <main className='flex-1 overflow-y-auto bg-neutral-950'>
          <Suspense fallback={<CargandoPagina />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
