// src/examples/analytics-identity.ts
// Ejemplos de uso de identificación de usuario con GA4

import { setUserId, setUserProperties } from '@/lib/analytics';

// ---- Interfaces de ejemplo ----

interface User {
  id: string;
  email: string;
  plan: 'free' | 'premium' | 'pro';
  country: string;
  signupDate: string;
  preferences: {
    language: string;
    notifications: boolean;
  };
}

interface UserSession {
  sessionId: string;
  device: string;
  source: string;
  campaign?: string;
}

// ---- Ejemplos de uso ----

/**
 * Ejemplo 1: Configuración básica tras login exitoso
 * 
 * Llamar este método cuando el usuario se autentica exitosamente.
 * Esto vincula todas las actividades subsecuentes con el ID del usuario.
 */
export const handleUserLogin = (user: User, session?: UserSession) => {
  // Establece el ID de usuario para cross-device tracking
  setUserId(user.id);

  // Configura propiedades personalizadas del usuario
  setUserProperties({
    // Datos de negocio
    user_plan: user.plan,
    user_country: user.country,
    user_language: user.preferences.language,
    
    // Metadatos útiles
    signup_date: user.signupDate,
    notifications_enabled: user.preferences.notifications,
    
    // Información de sesión si está disponible
    ...(session && {
      login_device: session.device,
      traffic_source: session.source,
      campaign: session.campaign,
    }),
  });

  console.log(`[Analytics] User identity set: ${user.id} (${user.plan})`);
};

/**
 * Ejemplo 2: Actualización de propiedades tras cambios de perfil
 * 
 * Llamar cuando el usuario actualiza su perfil o plan.
 */
export const handleUserUpdate = (updatedFields: Partial<User>) => {
  const propertiesToUpdate: Record<string, any> = {};

  // Mapea solo los campos que cambiaron
  if (updatedFields.plan) {
    propertiesToUpdate.user_plan = updatedFields.plan;
  }
  
  if (updatedFields.country) {
    propertiesToUpdate.user_country = updatedFields.country;
  }
  
  if (updatedFields.preferences?.language) {
    propertiesToUpdate.user_language = updatedFields.preferences.language;
  }
  
  if (updatedFields.preferences?.notifications !== undefined) {
    propertiesToUpdate.notifications_enabled = updatedFields.preferences.notifications;
  }

  if (Object.keys(propertiesToUpdate).length > 0) {
    setUserProperties(propertiesToUpdate);
    console.log('[Analytics] User properties updated:', propertiesToUpdate);
  }
};

/**
 * Ejemplo 3: Configuración para usuarios anónimos
 * 
 * Para visitantes que no se han registrado pero queremos trackear.
 */
export const handleAnonymousUser = (fingerprint: string, source?: string) => {
  // Usa un ID anónimo basado en fingerprinting o session
  setUserId(`anonymous_${fingerprint}`);

  setUserProperties({
    user_type: 'anonymous',
    traffic_source: source || 'direct',
    is_registered: false,
  });

  console.log(`[Analytics] Anonymous user tracked: ${fingerprint}`);
};

/**
 * Ejemplo 4: Limpieza tras logout
 * 
 * Limpia la identificación del usuario manteniendo la sesión analytics.
 */
export const handleUserLogout = () => {
  // En GA4, no hay un método directo para "unset" user_id
  // pero podemos establecer propiedades que indiquen el estado
  setUserProperties({
    user_type: 'logged_out',
    session_active: false,
  });

  console.log('[Analytics] User logged out - properties updated');
};

/**
 * Ejemplo 5: Segmentación avanzada
 * 
 * Para casos de uso específicos como e-commerce o SaaS.
 */
export const setAdvancedUserSegmentation = (
  userId: string,
  segment: {
    customerValue: 'high' | 'medium' | 'low';
    engagement: 'active' | 'casual' | 'dormant';
    lifecycle: 'new' | 'returning' | 'churning';
    preferredCategory?: string;
  }
) => {
  setUserId(userId);

  setUserProperties({
    customer_value: segment.customerValue,
    engagement_level: segment.engagement,
    lifecycle_stage: segment.lifecycle,
    preferred_category: segment.preferredCategory || 'general',
    
    // Timestamp para análisis temporal
    last_segmentation_update: new Date().toISOString(),
  });

  console.log(`[Analytics] Advanced segmentation set for user: ${userId}`, segment);
};

// ---- Casos de uso específicos para la aplicación ----

/**
 * Ejemplo específico para la app de fiestas de Mislata
 */
export const handleFestivalUserTracking = (
  userId: string,
  userPreferences: {
    favoriteEventTypes: string[];
    location: string;
    notifications: boolean;
  }
) => {
  setUserId(userId);

  setUserProperties({
    // Específico del dominio
    favorite_event_types: userPreferences.favoriteEventTypes.join(','),
    user_location: userPreferences.location,
    event_notifications: userPreferences.notifications,
    
    // Metadatos de la app
    app_version: '1.0.0',
    platform: 'web',
    feature_usage: 'events_tracking',
  });

  console.log(`[Analytics] Festival user tracking configured: ${userId}`);
};

// ---- Comentarios sobre buenas prácticas ----

/*
BUENAS PRÁCTICAS:

1. **Privacidad primero**: Solo trackea datos con consentimiento explícito
2. **Datos útiles**: Enfócate en propiedades que realmente usarás para análisis
3. **Consistencia**: Usa nombres estándar para propiedades similares
4. **Actualización**: Mantén las propiedades actualizadas cuando cambien
5. **Documentación**: Documenta qué significa cada propiedad personalizada

PROPIEDADES RECOMENDADAS PARA GA4:
- user_plan, user_type, user_country (segmentación)
- signup_date, last_login (cohortes temporales)
- engagement_level, customer_value (scoring de usuarios)
- preferred_*, notifications_* (personalización)

EVITAR:
- PII (emails, teléfonos, direcciones)
- Datos sensibles (contraseñas, tokens)
- Valores que cambien constantemente (timestamps exactos)
- Más de 25 user properties (límite de GA4)
*/
