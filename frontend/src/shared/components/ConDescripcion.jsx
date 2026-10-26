import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const ANCHO = 260; 
const MARGEN = 8;

export default function ConDescripcion({ nombre, descripcion, children }) {
    const [caja, setCaja] = useState(null);

    useEffect(() => {
        if (!caja) return undefined;
        const cerrar = () => setCaja(null);
        window.addEventListener('scroll', cerrar, true);
        window.addEventListener('resize', cerrar);
        return () => {
            window.removeEventListener('scroll', cerrar, true);
            window.removeEventListener('resize', cerrar);
        };
    }, [caja]);

    if (!descripcion) return children;

    const abrir = (e) => setCaja(e.currentTarget.getBoundingClientRect());
    const cerrar = () => setCaja(null);

    let estilo = null;
    if (caja) {
        const centro = caja.left + caja.width / 2;
        const min = ANCHO / 2 + MARGEN;
        const max = window.innerWidth - ANCHO / 2 - MARGEN;
        const left = Math.min(Math.max(centro, min), Math.max(min, max));
        const arriba = caja.top > 110; // si hay espacio, la burbuja va encima; si no, debajo
        estilo = arriba
            ? { left, top: caja.top - 6, transform: 'translate(-50%, -100%)' }
            : { left, top: caja.bottom + 6, transform: 'translate(-50%, 0)' };
    }

    return (
        <span
            className='inline-flex'
            onMouseEnter={abrir}
            onMouseLeave={cerrar}
            onFocus={abrir}
            onBlur={cerrar}
        >
            {children}
            {estilo &&
                createPortal(
                    <div
                        role='tooltip'
                        style={{ position: 'fixed', maxWidth: ANCHO, ...estilo }}
                        className='pointer-events-none z-[10000] w-max rounded-[10px] border border-white/10 bg-[#2A2A32] px-3 py-2 text-left shadow-[0_8px_24px_rgba(0,0,0,0.5)]'
                    >
                        {nombre && (
                            <div className='text-[11.5px] font-semibold text-neutral-100'>
                                {nombre}
                            </div>
                        )}
                        <div className='text-[11.5px] leading-snug text-neutral-400'>
                            {descripcion}
                        </div>
                    </div>,
                    document.body,
                )}
        </span>
    );
}