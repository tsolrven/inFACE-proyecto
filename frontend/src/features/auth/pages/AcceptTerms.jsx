import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/auth/authStore';
import { aceptarTerminos } from '@/shared/auth/auth.service';

export default function AcceptTerms() {
    const navigate = useNavigate();
    const setUsuario = useAuthStore((s) => s.actualizarUsuario);
    const logout = useAuthStore((s) => s.logout);
    const [acepta, setAcepta] = useState(false);
    const [investigacion, setInvestigacion] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!acepta) {
            setError('Debes aceptar los Términos y la Política de Privacidad para continuar');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const usuario = await aceptarTerminos({
                acepta_terminos: true,
                acepta_investigacion: investigacion,
            });
            setUsuario(usuario);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || 'No se pudo guardar tu aceptación');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='flex min-h-screen items-center justify-center bg-[#0B0B0E] px-4 py-10'>
            <form
                onSubmit={handleSubmit}
                className='w-full max-w-md rounded-2xl border border-white/[0.07] bg-[#1E1E24] p-6'
            >
                <h1 className='text-[20px] font-bold text-neutral-50'>Actualizamos nuestros términos</h1>
                <p className='mt-2 text-[13px] text-neutral-500'>
                    Para seguir usando InFACE necesitamos que aceptes la versión vigente.
                </p>
                {error && (
                    <p className='mt-4 rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12.5px] text-red-400'>
                        {error}
                    </p>
                )}
                <label className='mt-5 flex items-start gap-2.5 text-[12.5px] text-neutral-300'>
                    <input type='checkbox' checked={acepta} onChange={(e) => setAcepta(e.target.checked)} className='mt-0.5' />
                    <span>
                        He leído y acepto los{' '}
                        <Link to='/legal/terminos' target='_blank' className='text-pink-400 hover:underline'>Términos y Condiciones</Link>{' '}
                        y la{' '}
                        <Link to='/legal/privacidad' target='_blank' className='text-pink-400 hover:underline'>Política de Privacidad</Link>.
                    </span>
                </label>
                <label className='mt-3 flex items-start gap-2.5 text-[12.5px] text-neutral-400'>
                    <input type='checkbox' checked={investigacion} onChange={(e) => setInvestigacion(e.target.checked)} className='mt-0.5' />
                    <span>
                        (Opcional) Acepto que mi actividad en el Match de proyectos se use, de forma
                        seudonimizada, para evaluar los algoritmos de recomendación de una tesis.
                    </span>
                </label>
                <button
                    type='submit'
                    disabled={loading}
                    className='mt-5 w-full rounded-[10px] bg-pink-500 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50'
                >
                    {loading ? 'Guardando…' : 'Aceptar y continuar'}
                </button>
                <button type='button' onClick={logout} className='mt-3 w-full text-[12px] text-neutral-500 hover:text-neutral-300'>
                    Cerrar sesión
                </button>
            </form>
        </div>
    );
}