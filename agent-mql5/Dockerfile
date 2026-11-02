# The built-in Bot only speaks AG-UI and a model provider; the browser runs in a separate computer
# container so either side can be replaced independently.
FROM oven/bun:1.4-alpine

WORKDIR /app
RUN chown bun:bun /app
USER bun
# The lockfile as well as the manifest: `--frozen-lockfile` with no lockfile present resolves afresh
# and exits 0, so the file has to be here for the flag to mean anything.
COPY --chown=bun:bun agent-mql5/package.json agent-mql5/bun.lock ./agent-mql5/
RUN cd agent-mql5 && bun install --frozen-lockfile

# Preserve the repo layout so `../../shared/bot-prompt` resolves the same in the image and locally.
COPY --chown=bun:bun shared ./shared
COPY --chown=bun:bun agent-mql5/src ./agent-mql5/src

ENV PORT=4210
EXPOSE 4210
CMD ["bun", "agent-mql5/src/index.ts"]
