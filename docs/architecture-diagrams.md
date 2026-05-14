# CloneCloud Architecture Diagrams & Explanations

This document contains publication-quality Mermaid diagrams detailing the architecture of the CloneCloud DevSecOps Platform. These diagrams are designed for use in university reports and viva defenses.

## 1. High-Level System Architecture

This diagram illustrates the macro-level flow of the CloneCloud platform, from a developer's local environment through the CI/CD pipeline to the final ephemeral environment in Kubernetes.

```mermaid
graph TD
    %% Define styles
    classDef dev fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef git fill:#fce4ec,stroke:#d81b60,stroke-width:2px;
    classDef ci fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;
    classDef k8s fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    Dev["👨‍💻 Developer"]:::dev -->|1. Push Branch| GitHub["🐙 GitHub / Git Repo"]:::git
    GitHub -->|2. Webhook Trigger| Jenkins["⚙️ Jenkins CI/CD"]:::ci
    
    subgraph Jenkins Pipeline
        Jenkins --> Build["Build Artifacts"]
        Build --> Security["DevSecOps Scans"]
        Security --> DockerBuild["Docker Build & Push"]
    end
    
    DockerBuild -->|3. Push Images| Registry["🐳 Container Registry"]:::dev
    Jenkins -->|4. Helm Deploy| K8sCluster["☸️ Kubernetes Cluster"]:::k8s
    
    subgraph K8s Cluster
        Ingress["🌐 NGINX Ingress"]
        Frontend["💻 TaskFlow Frontend"]
        Backend["⚙️ TaskFlow Backend"]
        DB["🗄️ MongoDB"]
        
        Ingress -->|Route /| Frontend
        Ingress -->|Route /tasks| Backend
        Frontend -->|API Call| Backend
        Backend -->|Query| DB
    end
    
    Registry -->|5. Pull Images| Frontend
    Registry -->|5. Pull Images| Backend
```

**Explanation**: 
The high-level architecture demonstrates the GitOps-inspired workflow. A developer pushes code to a feature branch, triggering Jenkins. Jenkins orchestrates the build, executes security scans, builds container images, and pushes them to a registry. Finally, Jenkins dynamically provisions an ephemeral namespace in the Kubernetes cluster using Helm, deploying the microservice application consisting of a React frontend, Node.js backend, and MongoDB database.

---

## 2. CI/CD Pipeline Architecture

This diagram details the internal stages of the `Jenkinsfile` pipeline, emphasizing the strict progression from initialization to verification.

```mermaid
graph LR
    classDef stage fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px;
    classDef sec fill:#ffebee,stroke:#e53935,stroke-width:2px;
    classDef deploy fill:#e8f5e9,stroke:#43a047,stroke-width:2px;

    Start((Start)) --> Init["Initialize & Metadata"]:::stage
    Init --> SecScan["Secret Scanning<br/>(Trufflehog)"]:::sec
    SecScan --> DepScan["Dependency Scan<br/>(npm audit)"]:::sec
    DepScan --> Build["Build Images<br/>(Backend/Frontend)"]:::stage
    Build --> ImgScan["Container Scan<br/>(Trivy)"]:::sec
    ImgScan --> Push["Push Images<br/>(Registry)"]:::stage
    Push --> HelmDeploy["Deploy to K8s<br/>(Helm Upgrade)"]:::deploy
    HelmDeploy --> Verify["Verify Rollout Status"]:::deploy
    Verify -->|Failure| Rollback["Automated Rollback"]:::sec
    Verify -->|Success| LoadTest["Load Testing<br/>(k6)"]:::stage
    LoadTest --> End((End))
```

**Explanation**: 
The CI/CD pipeline enforces a "shift-left" security paradigm. If secret scanning, dependency scanning, or container image scanning fails, the pipeline halts immediately, preventing insecure code from reaching Kubernetes. Once deployed, the pipeline explicitly checks the rollout status. If health checks fail, an automated rollback is triggered. Upon success, post-deployment load testing validates performance.

---

## 3. Kubernetes Deployment Architecture

This diagram explores the internal topology of a dynamically generated ephemeral namespace, highlighting Kubernetes hardening features.

```mermaid
graph TD
    classDef svc fill:#e3f2fd,stroke:#1e88e5,stroke-width:2px;
    classDef pod fill:#e8f5e9,stroke:#43a047,stroke-width:2px;
    classDef policy fill:#ffe0b2,stroke:#fb8c00,stroke-width:2px;

    subgraph Namespace: clonecloud-feature-branch
        direction TB
        Ingress["🌐 Ingress<br/>(Dynamic Host)"]
        
        subgraph Network Policies [Zero Trust Isolation]
            FrontendSvc["Frontend Service<br/>(ClusterIP)"]:::svc
            BackendSvc["Backend Service<br/>(ClusterIP)"]:::svc
            MongoSvc["MongoDB Service<br/>(ClusterIP)"]:::svc
            
            FrontendDeploy["Frontend Deploy<br/>(React)"]:::pod
            BackendDeploy["Backend Deploy<br/>(Node.js)"]:::pod
            MongoSts["MongoDB StatefulSet"]:::pod
            
            HPA_F["HPA (Frontend)"]:::policy
            HPA_B["HPA (Backend)"]:::policy
            PDB["Pod Disruption Budget"]:::policy
            Secret["K8s Secrets"]:::policy
            
            Ingress --> FrontendSvc
            Ingress --> BackendSvc
            FrontendSvc --> FrontendDeploy
            BackendSvc --> BackendDeploy
            MongoSvc --> MongoSts
            
            FrontendDeploy -.->|Internal API Call| BackendSvc
            BackendDeploy -.->|TCP 27017| MongoSvc
            
            HPA_F -.->|Scales| FrontendDeploy
            HPA_B -.->|Scales| BackendDeploy
            Secret -.->|Injects MONGO_URI| BackendDeploy
            PDB -.->|Protects| BackendDeploy
        end
    end
```

**Explanation**: 
Within the ephemeral namespace, the architecture leverages advanced Kubernetes constructs. Traffic enters via an Ingress configured with a dynamic, branch-specific URL. Services route traffic to Deployments. The environment is fortified with Horizontal Pod Autoscalers (HPA) for load management, Pod Disruption Budgets (PDB) for high availability during cluster maintenance, and strict Network Policies enforcing zero-trust communication between the microservices. Secrets are securely injected rather than hardcoded.

---

## 4. Security Pipeline Architecture (DevSecOps)

This diagram focuses specifically on the security layers implemented to ensure "secure-by-design" deployments.

```mermaid
graph TD
    classDef scan fill:#fff3e0,stroke:#f57c00,stroke-width:2px;
    classDef decision fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px;
    classDef action fill:#ffebee,stroke:#e53935,stroke-width:2px;

    Code["Source Code"] --> SecretScan["1. Trufflehog / Gitleaks<br/>(Scans for hardcoded AWS keys, passwords)"]:::scan
    SecretScan --> Check1{Secrets Found?}:::decision
    Check1 -->|Yes| Fail1["Block Pipeline"]:::action
    
    Check1 -->|No| DepScan["2. NPM Audit<br/>(Scans package.json for CVEs)"]:::scan
    DepScan --> Check2{Critical CVEs?}:::decision
    Check2 -->|Yes| Fail2["Block Pipeline"]:::action
    
    Check2 -->|No| Build["Build Docker Image"]
    Build --> ImgScan["3. Trivy Container Scan<br/>(Scans OS & Binaries)"]:::scan
    ImgScan --> Check3{High/Crit Vulns?}:::decision
    Check3 -->|Yes| Fail3["Block Pipeline"]:::action
    
    Check3 -->|No| Deploy["Deploy to Kubernetes"]
```

**Explanation**: 
The DevSecOps pipeline implements three distinct security gates. First, static repository analysis checks for leaked secrets. Second, dependency analysis checks for vulnerable open-source libraries. Third, after the artifact is compiled, the container image itself is scanned for OS-level vulnerabilities. Failing any of these checks blocks the deployment, acting as a crucial defense mechanism.

---

## 5. Monitoring Architecture

This diagram shows how metrics are scraped and visualized for ephemeral environments.

```mermaid
graph LR
    classDef k8s fill:#e8f5e9,stroke:#43a047,stroke-width:2px;
    classDef prom fill:#fce4ec,stroke:#d81b60,stroke-width:2px;
    classDef graf fill:#fff3e0,stroke:#fb8c00,stroke-width:2px;

    subgraph Ephemeral Namespace
        BackendPod["Backend Pod (Node.js)"]:::k8s
        FrontendPod["Frontend Pod (React)"]:::k8s
        ServiceMon["ServiceMonitor<br/>(Dynamic Discovery)"]:::k8s
    end

    BackendPod -.->|Exposes /metrics| ServiceMon
    ServiceMon -->|Instructs Scrape| Prometheus["🔥 Prometheus<br/>(Metrics Aggregation)"]:::prom
    Prometheus -->|Provides Data| Grafana["📊 Grafana<br/>(Fleet Dashboard)"]:::graf
    
    User["👨‍💼 SRE / Developer"] -->|Views| Grafana
```

**Explanation**: 
To monitor rapidly changing ephemeral environments, CloneCloud uses the Prometheus Operator. A `ServiceMonitor` is deployed alongside the application in the Helm chart. Prometheus automatically discovers this new `ServiceMonitor` and begins scraping metrics from the backend pods. These metrics are then dynamically populated into a centralized Grafana dashboard designed to handle fleet-wide metrics.

---

## 6. Branch Lifecycle Architecture

This state diagram models the lifecycle of an ephemeral environment tied to a Git branch.

```mermaid
stateDiagram-v2
    [*] --> BranchCreated: Developer creates feature branch
    BranchCreated --> CodePushed: Commits Code
    CodePushed --> EnvProvisioning: CI/CD Triggered
    
    state EnvProvisioning {
        [*] --> Building
        Building --> Scanning
        Scanning --> Deploying
        Deploying --> [*]
    }
    
    EnvProvisioning --> ActiveEnvironment: Deployment Successful
    EnvProvisioning --> FailedEnvironment: Scans or Health Checks Fail
    
    ActiveEnvironment --> Testing: QA / Automation / Load Tests
    Testing --> CodePushed: Developer pushes fixes
    
    Testing --> PRMerged: Pull Request Approved
    PRMerged --> Teardown: Trigger Cleanup
    
    FailedEnvironment --> CodePushed: Fixes pushed
    
    Teardown --> [*]: Namespace Destroyed
```

**Explanation**: 
The lifecycle begins when a developer pushes a branch. The environment transitions to a provisioning state where building and scanning occur. Once active, the environment is used for QA and load testing. Iterative pushes update the environment. Crucially, the lifecycle definitively ends when the Pull Request is merged, triggering a teardown that reclaims all cluster resources.

---

## 7. Cleanup Workflow Architecture

This flowchart details the precise automation sequence for reclaiming cluster resources.

```mermaid
graph TD
    classDef event fill:#e1f5fe,stroke:#039be5,stroke-width:2px;
    classDef script fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px;
    classDef action fill:#ffebee,stroke:#e53935,stroke-width:2px;

    MergeEvent["🔀 GitHub PR Merge / Branch Delete"]:::event --> Webhook["Triggers Jenkins Webhook"]:::event
    Webhook --> Script["Execute cleanup-env.sh"]:::script
    
    Script --> Resolve["Resolve Namespace String<br/>(e.g., clonecloud-feat-task)"]
    Resolve --> Uninstall["helm uninstall clonecloud -n <namespace>"]:::action
    Uninstall --> DelNs["kubectl delete namespace <namespace>"]:::action
    DelNs --> Success["✅ Cluster Resources Reclaimed"]
```

**Explanation**: 
To prevent "cluster sprawl" (orphaned environments consuming expensive cloud resources), a rigid cleanup workflow is implemented. A branch deletion or PR merge event triggers a dedicated CI job that runs `cleanup-env.sh`. This script safely uninstalls the Helm release, ensuring clean deletion of persistent volume claims and ingresses, and finally deletes the namespace entirely.
