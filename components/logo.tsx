import Image from "next/image";

export default function Logo({ width = 120, height = 40 }: { width?: number; height?: number }) {
    return (
        <Image
            src="https://spalatoria-germana.ro/wp-content/uploads/2022/05/logo.webp"
            alt="Spalatoria Germana Logo"
            width={width}
            height={height}
            priority
            style={{ objectFit: "contain" }}
        />
    );
} 