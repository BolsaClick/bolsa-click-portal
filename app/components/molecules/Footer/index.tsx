import Link from "next/link"

const Footer = () => {
  return (
    <footer className="bg-[#F1F0F0] border-t text-bolsa-primary py-8 mt-12">
      <div className="max-w-6xl mx-auto flex md:flex-row flex-col items-center justify-center px-6 sm:px-12">
        <div className="flex justify-between flex-col gap-4  items-center">
          <div className="space-x-6 flex flex-col md:flex-row items-center justify-center">
            <Link
              href="/ajuda/termos-de-uso"
              className=" transition duration-300 hover:underline"
            >
              Termos de Uso
            </Link>
            <Link
              href="/ajuda/politica-de-privacidade"
              className="hover:underline transition duration-300"
            >
              Política de Privacidade
            </Link>
            <Link
              href="/ajuda/politica-de-cookies"
              className="hover:underline transition duration-300"
            >
              Política de Cookies
            </Link>
          </div>
          <div className="text-sm flex  flex-col items-center md:flex-row gap-2 text-stone-400  ">
            <p>&copy; 2025 Inovit Digital Publicidade</p>
            <p>CNPJ: 57.554.723/0001-50</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
