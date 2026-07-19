export function invalidRequestErrorResponse() {
  return {
    error: {
      code: 'INVALID_REQUEST',
      message: 'El cuerpo de la solicitud no tiene el formato esperado.',
    },
  };
}

export function resourceNotFoundErrorResponse() {
  return {
    error: {
      code: 'RESOURCE_NOT_FOUND',
      message: 'El recurso solicitado no existe.',
    },
  };
}

export function internalErrorResponse() {
  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'No se pudo completar la operacion.',
    },
  };
}
