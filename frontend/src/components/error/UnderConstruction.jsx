import errorBg from "@/assets/backgrounds/error_bg.jpg";

export default function UnderConstruction() {
    return (
        <section
            className="min-h-screen w-full flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url(${errorBg})` }}
        >
            <h1 className="text-4xl text-white font-bold bg-black/50 px-6 py-4 rounded-xl">
                🚧 This page is under construction. Please check back later! 🚧
            </h1>
        </section>
    )
}