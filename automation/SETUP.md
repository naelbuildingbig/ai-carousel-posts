# Carousel automation — prepared, not activated

Brand: Nael Building Big / @naelbuildingbig.
Schedule requested: daily at 09:00 Asia/Dubai. Start generation at 09:00; publishing follows rendering.

## Architecture

Make generator scenario: OpenAI Simple text prompt → Parse JSON → GitHub Make an API Call.
Remove the Iterator from this route: send the complete post once.

GitHub receives `repository_dispatch` event `carousel-ready`, renders all slides using the embedded approved black-and-white template on a macOS runner (Helvetica Neue), saves immutable JPEG URLs, then calls the Make publisher webhook.

Make publisher scenario: Custom webhook → Instagram Create a carousel post → Webhook response.
Map the webhook's `files` array into Instagram Files and its `caption` into Caption. Preserve the existing Facebook connection and selected Instagram account. Reply with JSON containing status `published` and the actual Instagram post ID. Do not return success before Instagram succeeds. Enable sequential processing and avoid automatic retries of an uncertain Instagram publishing operation.

## GitHub connection and configuration still required

Authorize Make's GitHub connection after reviewing its permissions. Restrict access to this repository where the provider supports it.
Upload the workflow into `.github/workflows/render-carousel.yml` and the automation directory into `automation/`.
Store the publishing webhook URL in repository Actions secret `MAKE_PUBLISH_WEBHOOK`. Never put it in a public file or Make dispatch payload.
GitHub's workflow requires contents:write to save rendered posts and delivery records to this repository.

## Generator request

GitHub API module: POST `/repos/naelbuildingbig/ai-carousel-posts/dispatches` with Content-Type application/json.
Use Make's JSON construction/mapping to construct this object safely (do not interpolate unescaped model output into quoted JSON):

    {
      "event_type": "carousel-ready",
      "client_payload": {
        "post_id": "YYYY-MM-DD in Asia/Dubai",
        "post": { "caption": "dynamic generated caption", "slides": [] }
      }
    }

Map `post` to the parsed generated object; never use the old fixed sample.
The post_id is today's Dubai date, allowing one daily carousel and blocking repeat delivery for the same date.
Choose a distinct daily topic and include the date in the generator prompt. Keep factual claims conservative; avoid news or release claims without verified sources.

## Publishing response

Configure Webhook response status 200, Content-Type application/json, and JSON:

    {"status":"published","post_id":"MAP_ACTUAL_INSTAGRAM_POST_ID_HERE"}

The label above is a setup placeholder, not a working mapping. Inspect the Instagram module's output and map its actual ID field. A plain `Accepted` reply is not treated as confirmed publication by the renderer.

## Reliability

Every carousel has its own posts/YYYY-MM-DD directory. The workflow checks image accessibility, commits delivery_started before sending the publish request, and records published only after a valid confirmation. Uncertain delivery becomes needs_review and is not automatically retried. This avoids blind duplicates but may require inspecting Make history and Instagram after a timeout. Do not delete delivery records without checking Instagram first.

## Verification completed

Input-validation tests passed (caption limits, slide counts/types, slide numbering, unsafe post IDs). JavaScript syntax checks passed. Dependency lockfile generated; npm reported no vulnerabilities. The approved template has been rendered in the local browser in prior work.

## Not yet verified or complete

No GitHub authorization, workflow upload/run, webhook creation, end-to-end render/delivery execution, Make mappings, or schedule activation has been completed. The current Make scenario remains inactive. Do not call this automation live until those steps are complete.
