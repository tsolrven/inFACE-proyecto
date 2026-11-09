import { useState } from 'react';
import Campo from '@/shared/components/form/Campo';
import ArchivosInput from '@/shared/components/form/ArchivosInput';
import { inputClasses } from '@/shared/components/form/inputClasses';
import { useArchivosForm } from '@/shared/hooks/useArchivosForm';
import Button from '@/shared/components/ui/Button';
import CharCounter from '@/shared/components/ui/CharCounter';
import { normalizarImagen } from '@/shared/lib/normalizarImagen';
import { mensajeDeError } from '@/shared/lib/errores';
import { mostrarToast } from '@/shared/stores/toastStore';
import {
  useCrearProducto,
  useEditarProducto,
} from '@/features/marketplace/hooks/useProductos';
import {
  CATEGORIAS,
  CONDICIONES,
  ESTADOS,
  TITULO_MIN,
  TITULO_MAX,
  DESCRIPCION_MAX,
  PRECIO_MAX,
  conPuntos,
  soloDigitos,
  FOTOS_MAX,
  FOTO_MAX_MB,
  FOTOS_EXTENSIONES,
  mostrarWhatsapp,
  esServicio,
  MODALIDADES,
  UNIDADES_PRECIO,
} from '@/features/marketplace/utils/catalogo';

const MB = 1024 * 1024;

const chip = (activo) =>
  `flex items-center gap-1.5 rounded-[10px] border px-3 py-2 text-[12.5px] font-medium transition-colors ${
    activo
      ? 'border-pink-500/50 bg-pink-500/10 text-neutral-100'
      : 'border-white/[0.07] text-neutral-400 hover:border-white/[0.18] hover:text-neutral-200'
  }`;

export default function ProductoForm({
  producto = null,
  onGuardado,
  onCancelar,
}) {
  const editando = !!producto;
  const crearMut = useCrearProducto();
  const editarMut = useEditarProducto();

  const [titulo, setTitulo] = useState(producto?.titulo ?? '');
  const [precio, setPrecio] = useState(producto ? String(producto.precio) : '');
  const [negociable, setNegociable] = useState(producto?.negociable ?? false);
  const [categoria, setCategoria] = useState(producto?.categoria ?? '');
  const [condicion, setCondicion] = useState(
    producto?.condicion && producto.condicion !== 'servicio'
      ? producto.condicion
      : '',
  );
  const [unidad, setUnidad] = useState(producto?.unidad_precio ?? '');
  const [modalidad, setModalidad] = useState(producto?.modalidad ?? '');
  const [estado, setEstado] = useState(producto?.estado ?? 'disponible');
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? '');
  const [ubicacion, setUbicacion] = useState(producto?.ubicacion ?? '');
  const [entregaDomicilio, setEntregaDomicilio] = useState(
    producto?.entrega_domicilio ?? false,
  );
  const [whatsapp, setWhatsapp] = useState(
    producto?.contacto_whatsapp
      ? mostrarWhatsapp(producto.contacto_whatsapp)
      : '',
  );
  const [instagram, setInstagram] = useState(
    producto?.contacto_instagram ?? '',
  );
  const [discord, setDiscord] = useState(producto?.contacto_discord ?? '');
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const servicio = esServicio(categoria);
  const conLugar = !servicio || modalidad !== 'online';

  const fotos = useArchivosForm({
    existentes: (producto?.archivos ?? []).filter((a) =>
      a.tipo_mime?.startsWith('image/'),
    ),
    max: FOTOS_MAX,
    maxBytes: FOTO_MAX_MB * MB,
    extensiones: FOTOS_EXTENSIONES,
    singular: 'foto',
    plural: 'fotos',
  });

  function validar() {
    const t = titulo.trim();
    if (t.length < TITULO_MIN) {
      return `El título debe tener al menos ${TITULO_MIN} caracteres`;
    }
    if (precio === '') {
      return 'Escribe el precio en pesos, solo números (0 si lo regalas)';
    }
    if (Number(precio) > PRECIO_MAX) return 'El precio es demasiado alto';
    if (!categoria) return 'Elige una categoría';
    if (servicio) {
      if (!unidad) return 'Indica cómo cobras: por hora, por clase, etc.';
      if (!modalidad) return 'Indica si es presencial, online o ambas';
    } else if (!condicion) {
      return 'Elige en qué condición está';
    }
    if (fotos.total === 0) return 'Sube al menos una foto del producto';
    if (!whatsapp.trim() && !instagram.trim() && !discord.trim()) {
      return 'Agrega al menos un medio de contacto: WhatsApp, Instagram o Discord';
    }
    return null;
  }

  async function guardar(e) {
    e.preventDefault();
    if (guardando) return;
    const problema = validar();
    if (problema) {
      setError(problema);
      return;
    }
    setError(null);
    setGuardando(true);

    const datos = {
      titulo: titulo.trim(),
      precio: Number(precio),
      categoria,
      ...(servicio ? { unidad_precio: unidad, modalidad } : { condicion }),
      negociable,
      descripcion: descripcion.trim(),
      entrega_domicilio: conLugar && entregaDomicilio,
      ubicacion: conLugar ? ubicacion.trim() : '',
      contacto_whatsapp: whatsapp.trim(),
      contacto_instagram: instagram.trim(),
      contacto_discord: discord.trim(),
    };

    try {
      const nuevas = await Promise.all(fotos.nuevos.map(normalizarImagen));

      if (editando) {
        const { producto: actualizado, fallos } = await editarMut.mutateAsync({
          id: producto.id,
          payload: { ...datos, estado },
          quitar: fotos.quitarIds,
          nuevos: nuevas,
        });
        if (fallos.subir > 0 || fallos.quitar > 0) {
          mostrarToast('Se guardó, pero algunas fotos no se pudieron cambiar');
        }
        onGuardado(actualizado ?? producto);
      } else {
        const creado = await crearMut.mutateAsync({
          payload: datos,
          fotos: nuevas,
        });
        onGuardado(creado);
      }
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo guardar el producto'));
      setGuardando(false);
    }
  }

  return (
    <form
      onSubmit={guardar}
      className='mx-auto flex w-full max-w-[680px] flex-col gap-4 p-3 sm:p-4'
    >
      <h1 className='text-[18px] font-bold text-neutral-100'>
        {editando ? 'Editar producto' : 'Publicar un producto'}
      </h1>

      <ArchivosInput
        control={fotos}
        label={servicio ? 'Foto de portada' : 'Fotos'}
        ayuda={`JPG, PNG, WEBP o GIF · hasta ${FOTO_MAX_MB} MB cada una. La primera es la portada.`}
        iconoDe={() => 'ti-photo'}
      />

      <Campo
        label='Título'
        extra={
          <CharCounter
            value={titulo}
            max={TITULO_MAX}
          />
        }
      >
        <input
          type='text'
          value={titulo}
          maxLength={TITULO_MAX}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder={
            servicio
              ? 'Ej: Clases de matemáticas para primer año'
              : 'Ej: Calculadora científica Casio fx-350'
          }
          className={inputClasses}
        />
      </Campo>

      <Campo label='Categoría'>
        <div className='flex flex-wrap gap-2'>
          {CATEGORIAS.map((c) => (
            <button
              key={c.id}
              type='button'
              aria-pressed={categoria === c.id}
              onClick={() => setCategoria(c.id)}
              className={chip(categoria === c.id)}
            >
              <i className={`ti ${c.icono} text-[14px]`} /> {c.label}
            </button>
          ))}
        </div>
      </Campo>

      <div className='grid gap-4 sm:grid-cols-2'>
        <Campo label={servicio ? 'Tarifa (CLP)' : 'Precio (CLP)'}>
          <div className='relative'>
            <span className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-neutral-500'>
              $
            </span>
            <input
              type='text'
              inputMode='numeric'
              value={conPuntos(precio)}
              onChange={(e) => setPrecio(soloDigitos(e.target.value))}
              placeholder='15.000'
              className={`${inputClasses} !pl-7`}
            />
          </div>
        </Campo>
        <Campo
          label={servicio ? '¿La tarifa es negociable?' : '¿Se puede negociar?'}
        >
          <label className='flex h-[38px] cursor-pointer items-center gap-2 text-[13px] text-neutral-300'>
            <input
              type='checkbox'
              checked={negociable}
              onChange={(e) => setNegociable(e.target.checked)}
              className='h-4 w-4 accent-pink-500'
            />
            Acepto ofertas
          </label>
        </Campo>
      </div>

      {servicio ? (
        <>
          <Campo label='¿Cómo cobras?'>
            <div className='flex flex-wrap gap-2'>
              {UNIDADES_PRECIO.map((u) => (
                <button
                  key={u.id}
                  type='button'
                  aria-pressed={unidad === u.id}
                  onClick={() => setUnidad(u.id)}
                  className={chip(unidad === u.id)}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </Campo>
          <Campo label='Modalidad'>
            <div className='flex flex-wrap gap-2'>
              {MODALIDADES.map((m) => (
                <button
                  key={m.id}
                  type='button'
                  aria-pressed={modalidad === m.id}
                  onClick={() => setModalidad(m.id)}
                  className={chip(modalidad === m.id)}
                >
                  <i className={`ti ${m.icono} text-[14px]`} /> {m.label}
                </button>
              ))}
            </div>
          </Campo>
        </>
      ) : (
        <Campo label='Condición'>
          <div className='flex flex-wrap gap-2'>
            {CONDICIONES.map((c) => (
              <button
                key={c.id}
                type='button'
                aria-pressed={condicion === c.id}
                onClick={() => setCondicion(c.id)}
                className={chip(condicion === c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </Campo>
      )}

      {editando && (
        <Campo label='Estado'>
          <div className='flex flex-wrap gap-2'>
            {ESTADOS.map((e) => (
              <button
                key={e.id}
                type='button'
                aria-pressed={estado === e.id}
                onClick={() => setEstado(e.id)}
                className={chip(estado === e.id)}
              >
                <i className={`ti ${e.icono} text-[14px]`} /> {e.label}
              </button>
            ))}
          </div>
        </Campo>
      )}

      <Campo
        label='Descripción (opcional)'
        extra={
          <CharCounter
            value={descripcion}
            max={DESCRIPCION_MAX}
          />
        }
      >
        <textarea
          rows={5}
          value={descripcion}
          maxLength={DESCRIPCION_MAX}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder={
            servicio
              ? 'Qué enseñas u ofreces, tu experiencia, horarios disponibles...'
              : 'Cuenta el estado, el tiempo de uso, qué incluye...'
          }
          className={`${inputClasses} resize-y`}
        />
      </Campo>

      {conLugar && (
        <div className='flex flex-col gap-3 rounded-[12px] border border-white/[0.07] bg-[#17171B] p-3'>
          <div className='flex items-center gap-2.5'>
            <span className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300'>
              <i className='ti ti-map-pin text-[18px]' />
            </span>
            <div>
              <p className='text-[12.5px] font-semibold text-neutral-200'>
                {servicio ? 'Lugar del servicio' : 'Punto de encuentro'}{' '}
                <span className='font-normal text-neutral-600'>(opcional)</span>
              </p>
              <p className='text-[11px] text-neutral-600'>
                {servicio
                  ? 'Dónde haces las clases o el servicio.'
                  : 'Dónde te juntas con el comprador para entregarlo.'}
              </p>
            </div>
          </div>
          <div className='relative'>
            <i className='ti ti-building-community pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-amber-300/80' />
            <input
              type='text'
              value={ubicacion}
              maxLength={80}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder='Ej: Campus Concepción, entrada principal'
              className={`${inputClasses} !pl-9`}
            />
          </div>
          <label className='flex cursor-pointer items-center gap-2 rounded-lg border border-white/[0.07] px-3 py-2 text-[13px] text-neutral-300 transition-colors hover:border-white/[0.18]'>
            <input
              type='checkbox'
              checked={entregaDomicilio}
              onChange={(e) => setEntregaDomicilio(e.target.checked)}
              className='h-4 w-4 accent-pink-500'
            />
            <i className='ti ti-truck-delivery text-[17px] text-violet-300' />
            {servicio ? 'Voy a domicilio' : 'Puedo llevarlo a domicilio'}
          </label>
        </div>
      )}

      <div className='flex flex-col gap-3 rounded-[12px] border border-white/[0.07] bg-[#17171B] p-3'>
        <div>
          <p className='text-[12.5px] font-semibold text-neutral-200'>
            Contacto <span className='text-pink-400'>(obligatorio)</span>
          </p>
          <p className='text-[11px] text-neutral-600'>
            Es obligatorio dejar al menos un medio de contacto, pero no
            necesitas llenar los tres: elige el que prefieras. Lo verán los
            usuarios de la plataforma; con WhatsApp e Instagram podrán abrir el
            chat o tu perfil con un clic.
          </p>
        </div>
        <Campo label='WhatsApp'>
          <div className='relative'>
            <i className='ti ti-brand-whatsapp pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-emerald-400' />
            <input
              type='tel'
              inputMode='tel'
              value={whatsapp}
              maxLength={20}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder='+56 9 1234 5678'
              className={`${inputClasses} !pl-9`}
            />
          </div>
        </Campo>
        <Campo label='Instagram'>
          <div className='relative'>
            <i className='ti ti-brand-instagram pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-pink-400' />
            <input
              type='text'
              value={instagram}
              maxLength={60}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder='@mi_usuario'
              className={`${inputClasses} !pl-9`}
            />
          </div>
        </Campo>
        <Campo label='Discord'>
          <div className='relative'>
            <i className='ti ti-brand-discord pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[16px] text-indigo-300' />
            <input
              type='text'
              value={discord}
              maxLength={40}
              onChange={(e) => setDiscord(e.target.value)}
              placeholder='mi_usuario'
              className={`${inputClasses} !pl-9`}
            />
          </div>
        </Campo>
      </div>

      {error && (
        <p className='rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-[12px] text-red-400'>
          {error}
        </p>
      )}

      <div className='flex justify-end gap-2 pb-4'>
        <Button
          type='button'
          variant='secondary'
          onClick={onCancelar}
          disabled={guardando}
        >
          Cancelar
        </Button>
        <Button
          type='submit'
          variant='primary'
          loading={guardando}
        >
          {editando ? 'Guardar cambios' : 'Publicar'}
        </Button>
      </div>
    </form>
  );
}
