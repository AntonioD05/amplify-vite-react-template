\documentclass[11pt]{article}

\usepackage[a4paper,margin=1in]{geometry}
\usepackage{hyperref}
\usepackage{enumitem}
\usepackage{listings}
\usepackage{xcolor}
\usepackage{inconsolata} % nicer mono font (optional)

\hypersetup{
  colorlinks=true,
  linkcolor=blue,
  urlcolor=blue,
  citecolor=blue
}

\lstdefinestyle{code}{
  basicstyle=\ttfamily\small,
  breaklines=true,
  frame=single,
  framerule=0.5pt,
  xleftmargin=1ex,
  xrightmargin=1ex,
  rulecolor=\color{black!20},
  keywordstyle=\color{blue!60!black}\bfseries,
  commentstyle=\color{green!40!black},
  stringstyle=\color{purple!60!black}
}

\title{\textbf{10-Q Inference (Amplify + API Gateway + Cognito + Lambda)}}
\author{}
\date{}

\begin{document}
\maketitle

\noindent
A Cognito-protected React app (Amplify UI) that calls an \textbf{edge Lambda} via \textbf{API Gateway (HTTP API + JWT authorizer)}. The edge Lambda validates input and invokes a \textbf{core 10-Q inference Lambda}, which fetches SEC filings and uses Bedrock (Claude) to answer questions.

\medskip
\noindent
\textbf{Live app:} \emph{add your Amplify URL here}

\noindent
\textbf{API base:} \emph{add your API Invoke URL (with stage) here}, e.g.
\url{https://<api-id>.execute-api.us-east-2.amazonaws.com/prod}

\section*{Features}
\begin{itemize}[leftmargin=1.2em]
  \item \textbf{Amplify Authenticator} (Cognito User Pool) sign-in.
  \item \textbf{Secure API} via API Gateway \textbf{HTTP API + Cognito JWT authorizer}.
  \item \textbf{Edge Lambda}: CORS + payload validation + identity pass-through.
  \item \textbf{Core Lambda}: SEC filing retrieval + Bedrock (Claude) inference.
  \item \textbf{UI} built with Amplify UI (\texttt{SelectField}, \texttt{TextField}, \texttt{Button}, \texttt{View}).
  \item Client guard to prevent querying \textbf{future periods}.
\end{itemize}

\section*{Architecture}
\begin{lstlisting}[style=code]
[ React (Amplify UI) ]
    |  Authorization: ID Token (Cognito)
    v
[ API Gateway HTTP API ] -- Cognito JWT Authorizer
    v
[ Edge Lambda (Python) ]   <- input validation, CORS, identity
    v
[ Core Lambda (Python) ]   <- SEC filing + Bedrock call
    ^
    |
[ JSON response to browser ]
\end{lstlisting}
