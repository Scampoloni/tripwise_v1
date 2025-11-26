// src/lib/server/validators.js

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function validateTripPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    errors.push('Request body fehlt oder ist ungueltig');
    return { valid: false, errors };
  }

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('Name ist Pflicht');
  }

  if (
    body.totalBudget !== undefined &&
    (Number.isNaN(Number(body.totalBudget)) || Number(body.totalBudget) < 0)
  ) {
    errors.push('totalBudget muss eine Zahl >= 0 sein');
  }

  if (body.participants !== undefined) {
    if (!Array.isArray(body.participants)) {
      errors.push('participants muss ein Array sein');
    } else {
      body.participants.forEach((participant, index) => {
        if (!participant || typeof participant !== 'object') {
          errors.push(`participants[${index}] muss ein Objekt sein`);
          return;
        }

        if (!isNonEmptyString(participant.id)) {
          errors.push(`participants[${index}].id ist Pflicht und darf nicht leer sein`);
        }

        if (!isNonEmptyString(participant.name)) {
          errors.push(`participants[${index}].name ist Pflicht und darf nicht leer sein`);
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateExpensePayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    errors.push('Request body fehlt oder ist ungueltig');
    return { valid: false, errors };
  }

  if (body.amount === undefined || Number.isNaN(Number(body.amount))) {
    errors.push('amount ist Pflicht und muss eine Zahl sein');
  }

  if (body.amount !== undefined && Number(body.amount) < 0) {
    errors.push('amount darf nicht negativ sein');
  }

  if (!isNonEmptyString(body.paidByParticipantId)) {
    errors.push('paidByParticipantId ist Pflicht und muss ein String sein');
  }

  if (body.splitBetweenAll !== undefined && typeof body.splitBetweenAll !== 'boolean') {
    errors.push('splitBetweenAll muss ein Boolean sein');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
