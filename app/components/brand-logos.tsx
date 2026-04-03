import Image from "next/image";

type LogoProps = {
  className?: string;
  priority?: boolean;
};

/**
 * Marca principal Cyelos (cabeceras, login).
 * Dimensiones intrínsecas flexibles con `object-contain`.
 */
export function LogoCyelos({ className = "", priority = false }: LogoProps) {
  return (
    <Image
      src="/logos/Logo-Cyelos.png"
      alt="Cyelos — Soluciones de Software"
      width={200}
      height={56}
      className={`h-9 w-auto max-w-[min(200px,55vw)] object-contain ${className}`}
      priority={priority}
    />
  );
}

/**
 * Marca secundaria Code Imagen (pie de página, crédito).
 */
export function LogoCodeImagen({ className = "" }: LogoProps) {
  return (
    <Image
      src="/logos/LogoCodeImagen.png"
      alt="Code Imagen"
      width={120}
      height={40}
      className={`h-7 w-auto max-w-[100px] object-contain opacity-90 ${className}`}
    />
  );
}
