import LegalDocument, { Seccion } from '@/shared/components/LegalDocument';
import { RESPONSABLE } from '@/shared/legal/terminos';

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument titulo='Política de Privacidad'>
      <Seccion titulo='1. Responsables del tratamiento'>
        <p>
          {RESPONSABLE.nombres}, estudiantes de la Universidad del Bío-Bío, en
          el marco de su proyecto de título. Contacto: {RESPONSABLE.contacto}.
        </p>
      </Seccion>
      <Seccion titulo='2. Qué datos tratamos'>
        <ul className='list-disc space-y-1 pl-5'>
          <li>
            Cuenta: correo institucional, contraseña (almacenada cifrada) y
            nombre de usuario.
          </li>
          <li>
            Perfil: nombre derivado de tu correo, carrera, campus y etiquetas de
            interés.
          </li>
          <li>
            Actividad: apuntes, comentarios, votos, proyectos, postulaciones,
            favoritos y descartes, y reportes.
          </li>
          <li>
            Recomendaciones: qué proyectos te mostramos, con qué algoritmo y qué
            hiciste con ellos.
          </li>
          <li>
            Técnicos: una cookie de sesión estrictamente necesaria (httpOnly) y
            registros de seguridad.
          </li>
        </ul>
        <p>No usamos cookies de publicidad ni de seguimiento de terceros.</p>
      </Seccion>
      <Seccion titulo='3. Para qué los usamos'>
        <ul className='list-disc space-y-1 pl-5'>
          <li>
            Prestar el servicio y mantener la seguridad y moderación de la
            comunidad.
          </li>
          <li>
            Recomendarte proyectos y personas afines (perfilado automatizado
            basado en tus etiquetas y en cómo interactúas con los proyectos:
            votos, guardados, descartes, comentarios y postulaciones, mediante
            agrupamiento K-Means). No se toman decisiones con efectos jurídicos
            sobre ti.
          </li>
          <li>
            Solo si lo aceptas de forma separada: evaluar la efectividad de los
            algoritmos para la tesis. Los datos se analizan seudonimizados y se
            publican de forma agregada.
          </li>
        </ul>
      </Seccion>
      <Seccion titulo='4. Con quién los compartimos'>
        <p>
          Tu nombre de usuario, carrera y contenido publicado son visibles para
          otros usuarios de la plataforma. No vendemos ni cedemos tus datos a
          terceros.
        </p>
      </Seccion>
      <Seccion titulo='5. Cuánto tiempo los conservamos'>
        <p>
          Mientras tu cuenta esté activa. Al terminar el período de pruebas o
          cuando solicites eliminar tu cuenta, se eliminan o anonimizan en un
          plazo de [COMPLETAR] días.
        </p>
      </Seccion>
      <Seccion titulo='6. Tus derechos'>
        <p>
          Puedes solicitar acceso, rectificación, supresión, oposición,
          portabilidad y bloqueo de tus datos, y retirar tu consentimiento en
          cualquier momento (por ejemplo, el de investigación) sin que afecte tu
          uso de la plataforma. Escríbenos a {RESPONSABLE.contacto}. Si no
          quedas conforme, puedes reclamar ante la autoridad de protección de
          datos personales.
        </p>
      </Seccion>
      <Seccion titulo='7. Seguridad'>
        <p>
          Contraseñas cifradas, sesiones con tokens de corta duración y acceso
          restringido a la base de datos. Ningún sistema es infalible; si ocurre
          una brecha que te afecte, te informaremos.
        </p>
      </Seccion>
    </LegalDocument>
  );
}
