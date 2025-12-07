export function validateTripPayload(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    errors.push('Request body fehlt oder ist ungueltig');
    return { valid: false, errors };
  }

  // Trip-Titel
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('Name ist Pflicht');
  }

  // 🌍 Pflichtfeld: Reiseziel (destinationName)
  if (!body.destinationName || typeof body.destinationName !== 'string' || !body.destinationName.trim()) {
    errors.push('destinationName ist Pflicht und muss ein nicht-leerer String sein');
  }

  // 📍 Optionale Geodaten, aber wenn vorhanden -> validieren
  if (body.destinationLat !== undefined) {
    if (body.destinationLat !== null && typeof body.destinationLat !== 'number') {
      errors.push('destinationLat muss eine Zahl sein, wenn angegeben');
    }
  }

  if (body.destinationLon !== undefined) {
    if (body.destinationLon !== null && typeof body.destinationLon !== 'number') {
      errors.push('destinationLon muss eine Zahl sein, wenn angegeben');
    }
  }

  if (body.destinationCountry !== undefined) {
    if (body.destinationCountry !== null && typeof body.destinationCountry !== 'string') {
      errors.push('destinationCountry muss ein String sein, wenn angegeben');
    }
  }

  if (body.latitude !== undefined) {
    if (body.latitude !== null && typeof body.latitude !== 'number') {
      errors.push('latitude muss eine Zahl sein, wenn angegeben');
    }
  }

  if (body.longitude !== undefined) {
    if (body.longitude !== null && typeof body.longitude !== 'number') {
      errors.push('longitude muss eine Zahl sein, wenn angegeben');
    }
  }

  if (body.cityName !== undefined && body.cityName !== null && typeof body.cityName !== 'string') {
    errors.push('cityName muss ein String sein, wenn angegeben');
  }

  if (body.countryName !== undefined && body.countryName !== null && typeof body.countryName !== 'string') {
    errors.push('countryName muss ein String sein, wenn angegeben');
  }

  // Budget
  if (
    body.totalBudget !== undefined &&
    (Number.isNaN(Number(body.totalBudget)) || Number(body.totalBudget) < 0)
  ) {
    errors.push('totalBudget muss eine Zahl >= 0 sein');
  }

  // Participants (deine alte Logik beibehalten)
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

  if (body.amount === undefined || body.amount === null) {
    errors.push('amount ist Pflicht');
  } else if (Number.isNaN(Number(body.amount))) {
    errors.push('amount muss eine Zahl sein');
  }

  if (body.currency !== undefined && !isNonEmptyString(body.currency)) {
    errors.push('currency muss ein nicht-leerer String sein, wenn angegeben');
  }

  if (body.category !== undefined && typeof body.category !== 'string') {
    errors.push('category muss ein String sein, wenn angegeben');
  }

  if (body.date !== undefined && !isValidDateString(body.date)) {
    errors.push('date muss ein gueltiger ISO-String sein, wenn angegeben');
  }

  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push('description muss ein String sein, wenn angegeben');
  }

  if (
    body.paidByParticipantId !== undefined &&
    body.paidByParticipantId !== null &&
    !isNonEmptyString(body.paidByParticipantId)
  ) {
    errors.push('paidByParticipantId muss ein nicht-leerer String sein, wenn angegeben');
  }

  if (
    body.splitBetweenAll !== undefined &&
    typeof body.splitBetweenAll !== 'boolean'
  ) {
    errors.push('splitBetweenAll muss ein Boolean sein, wenn angegeben');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDateString(value) {
  if (typeof value !== 'string') return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
}
