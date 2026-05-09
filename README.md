## Inspiration

Two computer science students, completely clueless about their own career paths, started digging through the internet for something — anything — that could point them in the right direction. What we found were psychometric tests that felt like relics from another era. Lengthy, generic, and frankly boring. The kind where you answer 200 questions and get told you'd be a good "manager or teacher."

We thought — why does this have to be so painful? What if the test itself was intelligent enough to adapt to *you* as you took it, and what if you could actually *see* all your career options laid out visually while you were doing it? That was the spark for **What Do I Do Dawg**.

---

## What it does

**What Do I Do Dawg** is an AI-powered psychometric career assessment that uses the **Holland Code (RIASEC)** personality framework combined with a **Neo4j career knowledge graph** and **Amazon Nova AI** to guide users through three intelligent rounds of questioning — each round narrowing down their career matches until they arrive at their perfect top 3–5 careers.

The three-stage pipeline works like this:

$$\text{18 Holland Questions} \rightarrow \text{Top 3 RIASEC Codes} \rightarrow \sim\!100 \text{ Jobs from Neo4j}$$

$$\rightarrow \text{30 AI-Generated Refinement Questions} \rightarrow \sim\!10 \text{ Jobs}$$

$$\rightarrow \text{30 AI-Generated Final Questions} \rightarrow \text{Top 3--5 Career Matches}$$

What makes it different from every other career test is that the questions aren't fixed — they are **generated fresh by AI** based on who you are and what jobs surfaced for you. Every user gets a completely personalised assessment path.

A visual **knowledge graph** sits alongside every round, letting you explore all job nodes and their relationships in real time. You're never blindly answering questions — you can see the universe of options shrinking as you go.

---

## How we built it

**Backend**
- **FastAPI** on **AWS EC2** as the core API server
- **Amazon Nova Lite** via **AWS Bedrock** as the LLM powering all three assessment stages
- **Neo4j** graph database storing the career knowledge graph — jobs, industries, skills, and their relationships
- **Firebase** for authentication and Firestore for storing each user's session and results
- **LangChain** to wire the agentic tool loops that let Nova query Neo4j directly

**Frontend**
- **React + TypeScript + Tailwind CSS** with a custom design system
- Interactive **knowledge graph visualisation** built alongside the assessment rounds
- Firebase Auth handling login and signup

**Infrastructure**
- Single **AWS EC2 m7i-flex.large** instance hosting everything
- **Nginx** serving the React build and proxying API calls to FastAPI
- **Docker** for containerisation
- **AWS Bedrock IAM role** attached to EC2 — no hardcoded credentials anywhere

---

## Challenges we ran into

**Graph databases** — neither of us had touched Neo4j before. Understanding nodes, relationships, and Cypher query syntax from scratch was a steep learning curve. The breakthrough was realising we could pass the graph schema directly to the LLM so it could write its own Cypher queries rather than us hardcoding them.

**The agentic pipeline** — getting each agent to correctly consume the output of the previous one was harder than expected. The refinement questions had to be specifically tailored to *your* job list, not generic questions. Getting the prompts tight enough so each stage filtered aggressively and asked the right questions took a lot of iteration.

**Prompt engineering** — getting the LLM to reliably return clean Python lists without markdown fences or preamble, every single time, across multiple chained calls, required careful output constraints and a robust parser using `ast.literal_eval` instead of `json.loads`.

---

## Accomplishments that we're proud of

- Built a fully functional end-to-end AI assessment pipeline that actually works — from personality scoring all the way to career recommendations pulled live from a graph database
- The knowledge graph visualisation running live alongside the assessment — something no other career test we found does
- Getting Amazon Nova to autonomously write and execute its own Cypher queries against Neo4j through an agentic tool loop
- Shipping a complete full-stack product — backend, frontend, database, auth, cloud infrastructure — as two students in a hackathon timeline

---

## What we learned

- **Neo4j** — graph databases, Cypher query language, schema introspection
- **AWS** — EC2, Bedrock, IAM roles, security groups, deployment
- **FastAPI** — async endpoints, Pydantic models, dependency injection, lifespan management
- **Firebase** — Auth token verification, Firestore session management
- **React + TypeScript** — component architecture, hooks, protected routes
- **Docker** — containerisation and deployment
- **LangChain** — agentic tool loops, multi-turn LLM conversations
- **Nginx** — reverse proxying, serving static builds

And the one thing that had nothing to do with the project technically but everything to do with surviving it — **Git**. Proper version control, branching, and not overwriting each other's work. Learned that one the hard way.

---

## What's next for What Do I Do Dawg

- **Deeper career roadmaps** — after identifying your top careers, the system guides you through the exact skills, certifications, and learning path to get there
- **Resume analysis** — upload your resume and the knowledge graph cross-references your existing skills against your matched careers to show how close you already are
- **Industry trend integration** — pulling live job market data so recommendations account for which careers are actually growing right now
- **Expanded knowledge graph** — currently focused on tech-adjacent careers, we want to expand to cover every major industry
- **Mobile app** — the assessment experience translated to native iOS and Android
