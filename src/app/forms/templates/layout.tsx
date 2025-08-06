
"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function FormTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-area, .printable-area * {
            visibility: visible;
          }
          .printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-4 no-print">
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir Formulario
            </Button>
        </div>
        <div className="bg-white p-8 sm:p-12 shadow-lg printable-area">
          {children}
        </div>
      </div>
    </div>
  );
}
