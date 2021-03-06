export default {
  app: {
    default_error: "Ha ocurrido un error inesperado, intente nuevamente",
    default_success: "La acción se ha completado satisfactoriamente",
    default_title: "Administrador",
    empty_field: "Campo vacío",
    error: "Error",
    form_error: "Existen errores en los datos ingresados",
    login: "Iniciar sesión",
    success: "Éxito",
    yes: "Sí",
    no: "No",
    search: "Buscar",
    actions: "Acciones",
    empty_data: "Sin datos. ¡Cree uno!",
    confirm: "Confirmar acción",
    next: "Siguiente",
    back: "Anterior",
    cancel: "Cancelar",
    logout: "Cerrar sesión",
    profile: "Mi perfil",
  },
  crud: {
    create: "Crear",
    read: "Listar",
    delete: "Eliminar",
    update: "Actualizar",
    delete_warning: "¿Estás seguro de que desea eliminar este recurso?",
  },
  err: {
    back: "Volver",
    retry: "Reintentar",
    request_with_url: "Ocurrió un error mientras se obtenía",
    page_not_found: "La página solicitada no existe",
    request_no_url: "Ocurrió un error mientras se realizaba la solicitud HTTP",
    requests: {
      prom_ne_res:
        "El número de respuestas HTTP no coincide con el número de solicitudes HTTP. Comuníquese con el administrador de su sistema",
      all_failed: "Todas las solicitudes HTTP han fallado",
    },
  },
  lgn: {
    password: "Contraseña",
    username: "Usuario",
    remember: "Recordarme",
  },
  nav: {
    home: "Inicio",
    users: {
      create: "Crear usuario",
      _: "Usuarios",
      update: "Actualizar usuario",
    },
    store: "Tienda",
    promotion: "Promoción",
    products: {
      create: "Crear producto",
      _: "Productos",
      update: "Actualizar producto",
    },
    undefined: "No definido",
    error: "Error",
    categories: {
      create: "Crear categoría",
      _: "Categorías",
      update: "Actualizar categoría",
    },
    banners: {
      create: "Crear banner",
      _: "Banners",
      update: "Actualizar banner",
    },
    login: "Iniciar sesión",
    providers: {
      _: "Proveedores",
      create: "Crear proveedor",
      update: "Actualizar proveedor",
    },
    settings: {
      _: "Configuraciones",
      payment_methods: {
        _: "Métodos de pago",
        update: "Actualizar método de pago",
      },
      coverage: "Cobertura",
      config: {
        _: "Variables globales",
        update: "Actualizar variable global",
      },
    },
  },
  rle: {},
  cmn: {
    name: "Nombre",
    price: "Precio",
    image: "Imagen",
    list: "Listado",
    level: "Nivel",
    is_active: "¿Habilitado?",
    drag_file: "Suelte o un archivo o ",
    reset: "Limpiar",
    refresh: "Refrescar",
    description: "Descripción",
    automatic: "Automático",
    i18n_errors:
      "Al menos una solicitud de localización ha fallado, verifique la integridad de los datos nuevos o comuníquese con el administrador",
    current_selection: "Selección actual",
    loading: "Cargando...",
    alternatives: "Alternativas",
    summary: "Resumen",
    images: "Imagenes",
    is_available: "¿Disponible?",
    is_food: "¿Es comida?",
    first_name: "Nombres",
    last_name: "Apellidos",
    email: "Correo electrónico",
    phone: "Teléfono",
    slug: "Slug",
    details: "Detalles",
    observations: "Observaciones",
    notes: "Notas",
    basic_info: "Información básica",
    extra_info: "Información opcional",
    start_date: "Inicia",
    end_date: "Finaliza",
    type: "Tipo",
    link: "Enlace",
    has_parent: "¿Tiene padre?",
  },
  eg: {
    file_input: {
      click_upload: "haga clic aquí",
    },
    promise_section: {
      last_ok: "Restaurar",
      loading: "[{plc}] Cargando...",
    },
    i18n_form: {
      form_header: "ID DEL IDIOMA: ",
      translate: "Traducir del {lang}",
      popover_content:
        "Si se activa esta opción, los datos de entrada en {0} se traducirán automáticamente al {1} en el momento de guardar.  Esta traducción puede activarse independientemente en cualquier momento.",
      popover_is_all_auto: "{0} está activado",
      translate_all_auto: "Traducir todo automáticamente",
      translate_auto: "Traducir automáticamente",
      translate_now: "Traducir ahora",
      this_lang: "este idioma",
      other_lang: "demás idiomas",
      popover_content_def:
        "Si se activa, los datos de entrada rellenados en {0} se traducirán automáticamente a todos los {1} en el momento de guardar. Si esta opción está activada, la traducción automática por idioma no puede ser desactivada (la traducción manual puede ser activada independientemente en cualquier momento).",
      to_translate: "Por traducir: {val}",
      translation_warning:
        "La solicitud de traducción se realizó correctamente, pero al menos una traducción individual falló",
      translation_error: "La solicitud de traducción ha fallado",
      wait_default: "Esperando datos en {def}...",
      validation_error: "Hay errores en los datos de entrada localizados",
      both_validation_error:
        "Hay errores en los datos de entrada localizados y no localizados",
      no_def:
        "El idioma por defecto especificado no se encontró en la respuesta del servidor",
      empty_translation: "No hay datos para traducir",
      translation_success: "¡La solicitud de traducción fue exitosa!",
      translate_deactivated: "Traducir automáticamente está desactivado",
    },
    image_input: {
      upload_error: "Se produjo un error al procesar el archivo",
      view: "Vista",
    },
    paginator: {
      title: "Lista de {model} activas",
    },
    promise_select: {
      placeholder: "Sin selección",
      empty: "No hay resultados que mostrar",
    },
    "ubigeo-select": {
      prov: "Provincia",
      dpto: "Departamento",
      dist: "Distrito",
    },
  },
  lang: {
    en: "Inglés",
    es: "Español",
    default_lang: "Idioma por defecto",
  },
  user: {
    password: "Contraseña",
    credentials: "Credenciales",
    gender: "Género",
    male: "Varón",
    female: "Mujer",
    birthday: "Cumpleaños",
    degree: "Grado de estudios",
    role: "Rol",
  },
  provider: {
    business_name: "Nombre del negocio",
    doc_type: "Tipo de documento",
    alien_card: "Carné de extranjería",
    dni: "DNI",
    doc: "N° documento",
    business_address: "Dirección del negocio",
    trust_level: "Nivel de confianza",
    additional_info: "Información adicional",
    business_info: "Información del negocio",
    personal_info: "Información personal",
  },
  product: {
    provider: "Proveedor",
    sold: "Vendidos",
    delete_last_detail: "No se puede eliminar el último detalle de un producto",
    detail_no_name: "El campo detalle es obligatorio",
    detail_no_value: "El campo valor es obligatorio",
    stock: "Stock",
  },
  config: {
    config: "Configuraciones globales",
    value: "Valor",
    type: "Tipo",
  },
  category: {
    parent: "Padre",
  },
  banner: {
    is_permanent: "¿Permanente?",
  },
  rule: {
    required: "Este campo es obligatorio",
    number: "Este campo debe ser numérico",
    ne_array: "Seleccione al menos un elemento",
  },
};
