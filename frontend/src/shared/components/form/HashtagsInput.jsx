import Campo from '@/shared/components/form/Campo';
import { inputClasses } from '@/shared/components/form/inputClasses';

// Campo de hashtags escritos en texto libre (separados por espacio o coma).
//   value:    texto tal como lo escribe el usuario
//   onChange: recibe el texto nuevo (no el evento)
//   error:    mensaje de validarHashtags(normalizarHashtags(value)) o null
export default function HashtagsInput({
  value,
  onChange,
  error = null,
  placeholder = '#calculo #integrales',
  label = 'Hashtags (opcional, separados por espacio o coma)',
}) {
  return (
    <Campo label={label}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label='Hashtags'
        aria-invalid={error ? true : undefined}
        className={inputClasses}
      />
      {error && <p className='text-[11px] text-red-400'>{error}</p>}
    </Campo>
  );
}
