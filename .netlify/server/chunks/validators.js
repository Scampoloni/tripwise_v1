function validateTripPayload(body) {
  const errors = [];
  if (!body || typeof body !== "object") {
    errors.push("Request body fehlt oder ist ungueltig");
    return { valid: false, errors };
  }
  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    errors.push("Name ist Pflicht");
  }
  if (!body.destinationName || typeof body.destinationName !== "string" || !body.destinationName.trim()) {
    errors.push("destinationName ist Pflicht und muss ein nicht-leerer String sein");
  }
  if (body.destinationLat !== void 0) {
    if (body.destinationLat !== null && typeof body.destinationLat !== "number") {
      errors.push("destinationLat muss eine Zahl sein, wenn angegeben");
    }
  }
  if (body.destinationLon !== void 0) {
    if (body.destinationLon !== null && typeof body.destinationLon !== "number") {
      errors.push("destinationLon muss eine Zahl sein, wenn angegeben");
    }
  }
  if (body.destinationCountry !== void 0) {
    if (body.destinationCountry !== null && typeof body.destinationCountry !== "string") {
      errors.push("destinationCountry muss ein String sein, wenn angegeben");
    }
  }
  if (body.latitude !== void 0) {
    if (body.latitude !== null && typeof body.latitude !== "number") {
      errors.push("latitude muss eine Zahl sein, wenn angegeben");
    }
  }
  if (body.longitude !== void 0) {
    if (body.longitude !== null && typeof body.longitude !== "number") {
      errors.push("longitude muss eine Zahl sein, wenn angegeben");
    }
  }
  if (body.cityName !== void 0 && body.cityName !== null && typeof body.cityName !== "string") {
    errors.push("cityName muss ein String sein, wenn angegeben");
  }
  if (body.countryName !== void 0 && body.countryName !== null && typeof body.countryName !== "string") {
    errors.push("countryName muss ein String sein, wenn angegeben");
  }
  if (body.totalBudget !== void 0 && (Number.isNaN(Number(body.totalBudget)) || Number(body.totalBudget) < 0)) {
    errors.push("totalBudget muss eine Zahl >= 0 sein");
  }
  if (body.participants !== void 0) {
    if (!Array.isArray(body.participants)) {
      errors.push("participants muss ein Array sein");
    } else {
      body.participants.forEach((participant, index) => {
        if (!participant || typeof participant !== "object") {
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
    errors
  };
}
function validateExpensePayload(body) {
  const errors = [];
  if (!body || typeof body !== "object") {
    errors.push("Request body fehlt oder ist ungueltig");
    return { valid: false, errors };
  }
  if (body.amount === void 0 || body.amount === null) {
    errors.push("amount ist Pflicht");
  } else if (Number.isNaN(Number(body.amount))) {
    errors.push("amount muss eine Zahl sein");
  }
  if (body.currency !== void 0 && !isNonEmptyString(body.currency)) {
    errors.push("currency muss ein nicht-leerer String sein, wenn angegeben");
  }
  if (body.category !== void 0 && typeof body.category !== "string") {
    errors.push("category muss ein String sein, wenn angegeben");
  }
  if (body.date !== void 0 && !isValidDateString(body.date)) {
    errors.push("date muss ein gueltiger ISO-String sein, wenn angegeben");
  }
  if (body.description !== void 0 && typeof body.description !== "string") {
    errors.push("description muss ein String sein, wenn angegeben");
  }
  if (body.paidByParticipantId !== void 0 && body.paidByParticipantId !== null && !isNonEmptyString(body.paidByParticipantId)) {
    errors.push("paidByParticipantId muss ein nicht-leerer String sein, wenn angegeben");
  }
  if (body.splitBetweenAll !== void 0 && typeof body.splitBetweenAll !== "boolean") {
    errors.push("splitBetweenAll muss ein Boolean sein, wenn angegeben");
  }
  return {
    valid: errors.length === 0,
    errors
  };
}
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function isValidDateString(value) {
  if (typeof value !== "string") return false;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp);
}
export {
  validateTripPayload as a,
  validateExpensePayload as v
};
