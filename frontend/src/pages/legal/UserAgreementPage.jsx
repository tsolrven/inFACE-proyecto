import LegalDocument, { Seccion } from '@/shared/components/LegalDocument';
import { RESPONSABLE } from '@/shared/legal/terminos';

export default function UserAgreementPage() {
  return (
    <LegalDocument titulo='Términos y Condiciones de uso'>
      <Seccion titulo='1. Qué es InFACE'>
        <p>
          InFACE es una plataforma web desarrollada como proyecto de título en la
          Universidad del Bío-Bío (Facultad de Ciencias Empresariales). Reúne
          materiales de estudio, foros, anuncios, formación de equipos para
          proyectos, difusión cultural y un marketplace entre estudiantes.
        </p>
      </Seccion>
      <Seccion titulo='2. Fase de pruebas'>
        <p>
          Esta versión está en fase de pruebas. Puede presentar errores, cambiar sin
          aviso y los datos podrían reiniciarse al terminar el período de prueba.
          No la uses para información que no quieras compartir con la comunidad.
        </p>
      </Seccion>
      <Seccion titulo='3. Quién puede usarla'>
        <p>
          Estudiantes y académicos de la Universidad del Bío-Bío con correo
          institucional (@alumnos.ubiobio.cl o @ubiobio.cl). Eres responsable de
          mantener segura tu contraseña y de la actividad de tu cuenta.
        </p>
      </Seccion>
      <Seccion titulo='4. Conducta y contenido'>
        <p>
          Te comprometes a cumplir las <a className='text-pink-400 hover:underline' href='/reglas'>Reglas de InFACE</a>.
          No se permite publicar contenido ilegal, ofensivo, discriminatorio, que
          infrinja derechos de autor o que vulnere la privacidad de otras personas.
        </p>
        <p>
          Conservas la propiedad de lo que publicas. Nos autorizas a mostrarlo dentro
          de la plataforma a los demás usuarios mientras tu contenido esté publicado.
        </p>
      </Seccion>
      <Seccion titulo='5. Moderación'>
        <p>
          Los demás usuarios pueden reportar contenido. El contenido que incumpla
          estas reglas puede ser ocultado o eliminado y las cuentas, suspendidas.
        </p>
      </Seccion>
      <Seccion titulo='6. Recomendaciones automáticas'>
        <p>
          El módulo de Match de proyectos sugiere proyectos y personas usando tus
          etiquetas de interés y técnicas de agrupamiento automático (clustering).
          Son sugerencias: no producen efectos jurídicos y tú decides si postular.
          Más detalle en la Política de Privacidad.
        </p>
      </Seccion>
      <Seccion titulo='7. Limitación de responsabilidad'>
        <p>
          Al ser un proyecto académico en pruebas, se ofrece «tal cual», sin garantías
          de disponibilidad. Las transacciones o acuerdos entre usuarios (por ejemplo
          en el marketplace) son responsabilidad exclusiva de quienes las realizan.
        </p>
      </Seccion>
      <Seccion titulo='8. Cambios'>
        <p>
          Si estos términos cambian, se actualizará la versión y se te pedirá
          aceptarlos nuevamente para seguir usando la plataforma.
        </p>
      </Seccion>
      <Seccion titulo='9. Ley aplicable y contacto'>
        <p>
          Se rigen por las leyes de la República de Chile. Responsables: {RESPONSABLE.nombres}.
          Contacto: {RESPONSABLE.contacto}.
        </p>
      </Seccion>
    </LegalDocument>
  );
}