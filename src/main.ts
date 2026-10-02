const app = document.querySelector<HTMLDivElement>('#app')

if (app) {
  app.innerHTML = `
    <main>
      <h1>HiveProcure</h1>
      <p data-testid="status">Application is running.</p>
    </main>
  `
}

export {}
