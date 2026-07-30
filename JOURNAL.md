Copy this file into your repo as `JOURNAL.md` and fill it in **as you work**, not at the end. Short honest notes beat polished essays. Bullet points are fine. We read this before we read your code.

One rule: **be honest.** "AI wrote most of this and I fixed two bugs" is a fine answer if it's true. We check the journal against the code and against your interview answers, and a made-up journal shows fast.

## 1. Prioritization

- What did you decide to build, in what order, and why? First I plan and build backend APIs and schema structure and then UI/Frontend according to the backend APIs.The order was in the form of priority P0,P1 and P2.
- What did you deliberately cut or skip? Why those? The photo upload feature was cut because it was optional and you have to config bucket and storage for it.I tried to implement it but it was not working as expected.


## 2. Key decisions

For each decision that shaped the project (aim for 3–6), one short block:

- **Decision:** what you chose (e.g. how the widget embeds, what happens to rejected testimonials, DB choice).Show I choose iframe for embedding the widget because I have used it previously in my subconcious project and its easy to prevent CORS issues. The rejected still shows in rejected colums and I choose supabase for DB as I want to host the project on vercel 
- **Options:** what else you considered. I considered using local storage for DB but it was not scalable and also not secure. I also considered using firebase for DB but I have worked with supabase so.For rejected testimonials I choose to show them in rejected colums and not delete them because it might be useful for future reference.  
- **Why:** why you picked this one. I choose iframe because it is easy to prevent CORS issues. I choose supabase because it is easy to use and it is free for small projects. I choose to show rejected testimonials in rejected colums because it might be useful for future reference.

Include the calls you made where the brief was silent.

## 3. Working with AI agents

- **Tools and models used:** which agent/editor (Claude Code, Codex, Cursor, Cline, aider, …), which models, and for what kind of work. I used claude web for the development of the project.
- **How you split the work:** what tasks you gave the agent, what you kept for yourself, and why. I gave claude web the task of generating the code for the project andI orchesfetewd  I reviewed and tested the code.
- **Your agent setup:** if you wrote instruction/rules files, skills, or commands (they must be committed — see the brief), say briefly what each is for and what problem it solved. If you used none, say so here. claude.me attached
- **Your 3–5 most important prompts:** paste them and say why each worked — or didn't. 
- **At least one time AI was wrong:** what it produced, how you noticed, what you did. If AI was never wrong in 6+ hours of use, say so — and expect us to ask about it. - The UX part terrible by claude , I had to navigate through URL and no button were there to navigate. I would make better UX added photo feature but again in 30min of usuage the tokens were used up.
- **Something you rejected:** AI output you threw away or heavily rewrote, and why. - The URL navigation and UX & UI it was classic AI slop

## 4. Verification

- How did you convince yourself the code actually works? Be specific: what did you run, click, test, or inspect? I manual run whole run and tested each and every feature.
- What do you know is still broken or fragile? The photo upload feature is not working as expected. I tried to implement it but it was not working.

## 5. If I had 5 more hours

- What would you do next, in order? I would implement the photo upload feature and also add some more features like email notifications and also add some more features like email notifications and auth and also work on the UX and UI. to make like proper product.