import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { actualizarMisIntereses } from '../services/perfil';
import EtiquetasPicker from '../components/EtiquetasPicker';

export default function Onboarding() {
    const navigate = useNavigate();
    const marcarInteresesConfigurados = useAuthStore((s) => s.marcarInteresesConfigurados);
    const usuario = useAuthStore((s) => s.usuario);

    const [etiquetaIds, setEtiquetaIds] = useState([]);
    const [error, setError] = useState(null);
    const [guardando, setGuardando] = useState(false);

    async function handleContinuar() {
        if (etiquetaIds.length === 0) {
            setError('Elige al menos un interés para continuar.');
            return;
        }
        setGuardando(true);
        setError(null);
        try {
            await actualizarMisIntereses(etiquetaIds);
            marcarInteresesConfigurados();
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    }

    return (
        <div className='min-h-screen bg-neutral-950 flex items-center justify-center px-4 py-10'>
            <div className='w-full max-w-lg'>
                <div className='mb-6 text-center'>
                    <span className='text-xs font-mono tracking-widest text-indigo-400 uppercase'>
                        UBB · Inface
                    </span>
                    <h1 className='mt-2 text-2xl font-bold text-white leading-tight'>
                        ¡Bienvenido{usuario?.nombre_usuario ? `, ${usuario.nombre_usuario}` : ''}! Configura tu perfil
                    </h1>
                    <p className='mt-2 text-sm text-neutral-400'>
                        Elige tus intereses (tecnologías, habilidades, temas) para que podamos recomendarte proyectos
                        y personas afines desde el primer día. Puedes editarlos más adelante desde tu perfil.
                    </p>
                </div>

                <div className='rounded-2xl border border-white/[0.07] bg-[#1E1E24] p-5'>
                    {error && (
                        <div className='mb-4 rounded-[10px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-[12.5px] text-red-400'>
                            {error}
                        </div>
                    )}

                    <EtiquetasPicker
                        selectedIds={etiquetaIds}
                        onChange={setEtiquetaIds}
                        max={15}
                        emptyHint='Aún no seleccionas intereses.'
                    />

                    <button
                        type='button'
                        onClick={handleContinuar}
                        disabled={guardando}
                        className='mt-5 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition
                        hover:bg-indigo-500 active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {guardando ? 'Guardando…' : 'Empezar a usar InFACE'}
                    </button>
                </div>
            </div>
        </div>
    );
}
