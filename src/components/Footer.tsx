import React from 'react'

export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-card text-card-foreground footer-nav-bg">
      <div className="mx-auto max-w-7xl px-4 py-6 text-sm flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <p className="text-muted-foreground">
          © 2025 Isaac Mulatya. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
          <a href="mailto:isaacmulatya65@gmail.com" className="hover:text-foreground underline-offset-4 hover:underline">Email</a>
          <a href="https://wa.me/254114161227" target="_blank" rel="noreferrer" className="hover:text-foreground underline-offset-4 hover:underline">WhatsApp</a>
        </div>
      </div>
    </footer>
  )
}



