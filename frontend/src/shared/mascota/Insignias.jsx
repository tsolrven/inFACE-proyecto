import { CARGO_POR_ID } from './catalogo';

export function NombrePerfil({ perfil, className = '' }) {
  const nombre = perfil.nombre_completo || perfil.nombre_usuario;
  const esJefa = perfil.cargo === 'jefe_carrera';
  return (
    <span
      className={`${className} ${esJefa ? 'text-amber-300' : 'text-neutral-100'}`}
    >
      {nombre}
    </span>
  );
}

function Insignia({ icon, children, className, title }) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${className}`}
    >
      <i className={`ti ${icon} text-[12px]`} />
      {children}
    </span>
  );
}

export function InsigniasPerfil({ perfil }) {
  const cargo = perfil.cargo ? CARGO_POR_ID[perfil.cargo] : null;
  const hay = cargo || perfil.es_moderadora || perfil.generacion;
  if (!hay) return null;

  return (
    <div className='mt-2 flex flex-wrap gap-1.5'>
      {cargo && (
        <Insignia
          icon={perfil.cargo === 'jefe_carrera' ? 'ti-crown' : 'ti-id-badge-2'}
          title='Cargo en la universidad'
          className={
            perfil.cargo === 'jefe_carrera'
              ? 'border-amber-300/40 bg-amber-300/10 text-amber-300'
              : perfil.cargo === 'funcionario'
                ? 'border-sky-300/30 bg-sky-300/10 text-sky-300'
                : 'border-emerald-300/30 bg-emerald-300/10 text-emerald-300'
          }
        >
          {cargo.label}
        </Insignia>
      )}
      {perfil.es_moderadora && (
        <Insignia
          icon='ti-shield-check'
          title='Modera la plataforma'
          className='border-pink-500/40 bg-pink-500/10 text-pink-400'
        >
          Moderadora
        </Insignia>
      )}
      {perfil.generacion && (
        <Insignia
          icon='ti-school'
          title='Generación (según su correo institucional)'
          className='border-violet-400/30 bg-violet-400/10 text-violet-300'
        >
          Generación {perfil.generacion}
        </Insignia>
      )}
    </div>
  );
}
