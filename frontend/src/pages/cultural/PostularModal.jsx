import { useState } from 'react';
import ModalShell from './ModalShell';

export default function PostularModal({ proyecto, onClose, onPostular }) {
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);

    async function handleEnviar(e) {
        e.preventDefault();
        const texto = mensaje.trim();
        if (texto.length < 10) {
            setError('Cuéntale al creador por qué quieres unirte (mínimo 10 caracteres)');
            return;
        }
        setError(null);
        setEnviando(true);
        try {
            await onPostular(proyecto.id, texto);
            setEnviado(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setEnviando(false);
        }
    }

    return (
        <ModalShell
            title='Postularme a este proyecto'
            subtitle={proyecto.titulo}
            onClose={onClose}
            maxWidth='max-w-[480px]'
        >
            {enviado ? (
                <div className='flex flex-col items-center gap-3 py-4 text-center'>
                    <i className='ti ti-circle-check text-4xl text-emerald-400' />
                    <div>
                        <div className='text-[14px] font-bold text-neutral-100'>¡Postulación enviada!</div>
                        <p className='mt-1 text-[12.5px] text-neutral-500'>
                            Puedes revisar su estado en la pestaña "Mis postulaciones".
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className='mt-1 rounded-[10px] bg-pink-500 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-pink-600'
                    >
                        Entendido
                    </button>
                </div>
            ) : (
                <form
                    onSubmit={handleEnviar}
                    className='flex flex-col gap-3'
                >
                    {error && (
                        <div className='rounded-[10px] border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-[12px] text-red-400'>
                            {error}
                        </div>
                    )}
                    <div>
                        <label className='mb-1.5 block text-[11px] font-medium text-neutral-500'>
                            Cuéntale al creador por qué te gustaría unirte
                        </label>
                        <textarea
                            autoFocus
                            value={mensaje}
                            onChange={(e) => setMensaje(e.target.value)}
                            rows={5}
                            placeholder='Ej: Tengo experiencia en React y me interesa aportar en el frontend...'
                            className='w-full resize-none rounded-[10px] border border-white/[0.07] bg-[#1E1E24] px-3.5 py-2.5 text-[13px] text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-pink-500/50'
                        />
                    </div>
                    <div className='flex justify-end gap-2 border-t border-white/[0.07] pt-3'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='rounded-[10px] border border-white/[0.07] px-4 py-2 text-[12.5px] font-medium text-neutral-400 transition hover:text-neutral-100'
                        >
                            Cancelar
                        </button>
                        <button
                            type='submit'
                            disabled={enviando}
                            className='inline-flex items-center gap-1.5 rounded-[10px] bg-pink-500 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50'
                        >
                            <i className='ti ti-send text-[13px]' />
                            {enviando ? 'Enviando…' : 'Enviar postulación'}
                        </button>
                    </div>
                </form>
            )}
        </ModalShell>
    );
}