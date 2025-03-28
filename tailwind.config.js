/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      extend: {
        colors: {
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          primary: {
            DEFAULT: "hsl(var(--primary))",
            foreground: "hsl(var(--primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
            blue: {
              DEFAULT: "hsl(var(--accent-blue))",
              foreground: "hsl(var(--accent-blue-foreground))",
              border: "hsl(var(--accent-blue-border))"
            }
          },
          popover: {
            DEFAULT: "hsl(var(--popover))",
            foreground: "hsl(var(--popover-foreground))",
          },
          card: {
            DEFAULT: "hsl(var(--card))",
            foreground: "hsl(var(--card-foreground))",
          },
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
        keyframes: {
          "accordion-down": {
            from: { height: 0 },
            to: { height: "var(--radix-accordion-content-height)" },
          },
          "accordion-up": {
            from: { height: "var(--radix-accordion-content-height)" },
            to: { height: 0 },
          },
          "collapsible-down": {
            from: { height: 0 },
            to: { height: 'var(--radix-collapsible-content-height)' },
          },
          "collapsible-up": {
            from: { height: 'var(--radix-collapsible-content-height)' },
            to: { height: 0 },
          },
          "float": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-5px)" },
          },
          "pulse-subtle": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.8 },
          },
          "slide-up": {
            "0%": { transform: "translateY(10px)", opacity: 0 },
            "100%": { transform: "translateY(0)", opacity: 1 },
          },
          "slide-down": {
            "0%": { transform: "translateY(-10px)", opacity: 0 },
            "100%": { transform: "translateY(0)", opacity: 1 },
          },
          "fade-in": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
          "spin-slow": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
          "collapsible-down": "collapsible-down 0.2s ease-out",
          "collapsible-up": "collapsible-up 0.2s ease-out",
          "float": "float 3s ease-in-out infinite",
          "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
          "slide-up": "slide-up 0.3s ease-out",
          "slide-down": "slide-down 0.3s ease-out",
          "fade-in": "fade-in 0.3s ease-out",
          "spin-slow": "spin-slow 6s linear infinite",
        },
        typography: {
          DEFAULT: {
            css: {
              maxWidth: '100%',
              color: 'var(--tw-prose-body)',
              '[class~="lead"]': {
                color: 'var(--tw-prose-lead)',
              },
              a: {
                color: 'var(--tw-prose-links)',
                textDecoration: 'underline',
                fontWeight: '500',
              },
              strong: {
                color: 'var(--tw-prose-bold)',
                fontWeight: '600',
              },
              'ol > li::marker': {
                fontWeight: '400',
                color: 'var(--tw-prose-counters)',
              },
              'ul > li::marker': {
                color: 'var(--tw-prose-bullets)',
              },
              hr: {
                borderColor: 'var(--tw-prose-hr)',
                borderTopWidth: 1,
              },
              blockquote: {
                fontWeight: '500',
                fontStyle: 'italic',
                color: 'var(--tw-prose-quotes)',
                borderLeftWidth: '0.25rem',
                borderLeftColor: 'var(--tw-prose-quote-borders)',
                paddingLeft: '1rem',
              },
              h1: {
                color: 'var(--tw-prose-headings)',
                fontWeight: '800',
              },
              h2: {
                color: 'var(--tw-prose-headings)',
                fontWeight: '700',
              },
              h3: {
                color: 'var(--tw-prose-headings)',
                fontWeight: '600',
              },
              h4: {
                color: 'var(--tw-prose-headings)',
                fontWeight: '600',
              },
              'figure figcaption': {
                color: 'var(--tw-prose-captions)',
              },
              code: {
                color: 'var(--tw-prose-code)',
                fontWeight: '400',
              },
              'code::before': {
                content: '""',
              },
              'code::after': {
                content: '""',
              },
              pre: {
                color: 'var(--tw-prose-pre-code)',
                backgroundColor: 'var(--tw-prose-pre-bg)',
                overflowX: 'auto',
                fontWeight: '400',
              },
              'pre code': {
                backgroundColor: 'transparent',
                borderWidth: '0',
                borderRadius: '0',
                padding: '0',
                fontWeight: 'inherit',
                color: 'inherit',
                fontSize: 'inherit',
                fontFamily: 'inherit',
                lineHeight: 'inherit',
              },
              'pre code::before': {
                content: 'none',
              },
              'pre code::after': {
                content: 'none',
              },
              table: {
                width: '100%',
                tableLayout: 'auto',
                textAlign: 'left',
                marginTop: '2em',
                marginBottom: '2em',
              },
              thead: {
                borderBottomWidth: '1px',
                borderBottomColor: 'var(--tw-prose-th-borders)',
              },
              'thead th': {
                color: 'var(--tw-prose-headings)',
                fontWeight: '600',
                verticalAlign: 'bottom',
              },
              'tbody tr': {
                borderBottomWidth: '1px',
                borderBottomColor: 'var(--tw-prose-td-borders)',
              },
              'tbody tr:last-child': {
                borderBottomWidth: '0',
              },
              'tbody td': {
                verticalAlign: 'baseline',
              },
            },
          },
        },
      },
    },
    plugins: [
      require("tailwindcss-animate"),
      require("@tailwindcss/typography"),
    ],
  };