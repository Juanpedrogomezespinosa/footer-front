import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

/**
 * Validador para confirmar que dos campos de contraseña coinciden.
 */
export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const newPassword = control.get("newPassword");
  const confirmPassword = control.get("confirmPassword");

  // Si los controles no han cargado o no se han tocado, no hacer nada
  if (
    !newPassword ||
    !confirmPassword ||
    !newPassword.value ||
    !confirmPassword.value
  ) {
    return null;
  }

  // Si los valores son diferentes, establecer un error en 'confirmPassword'
  if (newPassword.value !== confirmPassword.value) {
    // Es importante setear el error en el control 'confirmPassword'
    // para que se muestre el mensaje de error debajo de él.
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    // Si eran diferentes pero ahora son iguales, quitar el error
    if (confirmPassword.hasError("passwordMismatch")) {
      confirmPassword.setErrors(null);
    }
    return null;
  }
};
