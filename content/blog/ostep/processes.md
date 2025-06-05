---
title: "Processes"
date: 2025-05-26
draft: false
tags: ["operating systems", "processes"]
---

## Notes on Processes

## Virtualization  virtualization

**The Core Idea: Illusion Creation**
Virtualization is a general technique where the Operating System (OS) takes a physical resource (like the CPU or memory) and transforms it into a more general, powerful, and easy-to-use virtual form[cite: 4]. This creates the illusion for each running program that it exclusively possesses resources that are actually shared.

* **Illusion:** Each running program (process) operates as if:
    * It has its **own dedicated CPU** (or multiple CPUs)[cite: 4].
    * It has its **own private memory space** (address space)[cite: 4].
* **Key Aspects:** The OS aims to achieve this virtualization with:
    * **Efficiency:** Minimizing the overhead introduced by the OS. Virtualization should not make programs run significantly slower[cite: 4, 12].
    * **Control/Security (Protection/Isolation):** Ensuring that processes are isolated from one another and cannot harm the OS or other processes. This involves restricting what user programs can do directly[cite: 4, 5].

---
## CPU Virtualization: From One to Many

CPU virtualization is how the OS creates the illusion of multiple virtual CPUs from a single physical CPU (or a small set of them)[cite: 4]. This allows many programs to appear to run concurrently.

* **How it's done:**
    * **Time Sharing:** The CPU's time is divided among multiple processes. Each process runs for a short period (a time slice), then the OS switches to another process[cite: 6]. This rapid switching creates the illusion of simultaneous execution.
        * This gives each process the feeling of having its own **Virtual CPU**[cite: 4].
    * **Space Sharing (Multiprogramming):** Multiple processes reside in memory simultaneously, allowing the OS to switch between them efficiently, especially when one process is waiting for a slow I/O operation[cite: 5, 10].
* **The Abstraction: Process**
    * A **process** is the OS's abstraction for a running program[cite: 6]. It is the entity that the OS manages and schedules on the CPU.
    * A program is just a static set of instructions and data on disk; a process is that program in action, loaded into memory and executing[cite: 6].

---
## Anatomy of a Process

A process encapsulates all the state a program needs to run and resume. This machine state includes[cite: 6]:

* **Memory (Address Space):**
    * **Code (Text Segment):** The instructions of the program. This is often static and resides in memory[cite: 6, 10].
    * **Static Data:** Global variables and other static data used by the program[cite: 6].
    * **Heap:** Dynamically allocated memory used by the program as it runs (e.g., via `malloc()` in C). It typically grows downwards (towards lower addresses) or upwards, depending on convention[cite: 6, 10].
    * **Stack:** Used for function call management, storing local variables, function parameters, and return addresses. It typically grows upwards (towards higher addresses) or downwards, in the opposite direction of the heap[cite: 6, 10].
    * Collectively, these memory segments form the process's **address space**, which is its view of memory[cite: 6, 10].
* **Registers:**
    * **Program Counter (PC) / Instruction Pointer (IP):** Points to the next instruction to be executed[cite: 6].
    * **Stack Pointer (SP):** Points to the top of the current process's stack[cite: 6].
    * **Frame Pointer (FP):** Used to manage the stack for function calls[cite: 6].
    * **General Purpose Registers (GPRs):** Used for computation and data manipulation during program execution[cite: 6].
* **I/O State:**
    * Information about I/O operations, such as a list of open files the process is currently using[cite: 6].
* **Process Control Block (PCB):** The OS maintains a data structure for each process, often called a Process Control Block (PCB) or process structure. This structure stores all vital information about the process, including its state (running, ready, blocked), PID, register context, memory pointers, open files, etc.[cite: 7].

---
## Mechanisms vs. Policies

The OS uses a combination of mechanisms and policies to manage processes and virtualize resources[cite: 6].

* **Mechanisms (How?):** These are the low-level methods or protocols that implement a needed piece of functionality[cite: 6]. They answer *how* something is done.
    * Example: A context switch is a mechanism that allows the OS to stop one process and start another[cite: 6].
* **Policies (Higher-Level Decisions / Which?):** These are algorithms for making decisions within the OS[cite: 6]. They answer *which* action to take.
    * Example: A scheduling policy decides which process to run next from the set of ready processes, perhaps based on historical usage, workload type, or performance goals[cite: 6].
    * **TIP:** Separating policy from mechanism is a common design principle. It allows policies to be changed without rethinking the underlying mechanisms, promoting modularity[cite: 7].

---
## Core Mechanism for CPU Virtualization: Limited Direct Execution (LDE)

To achieve both efficiency and control, the OS employs **Limited Direct Execution (LDE)**[cite: 8].

* **Direct Execution Aspect:**
    * **Efficiency:** The program's instructions run directly on the hardware CPU for maximum speed[cite: 8].
    * **Process:**
        1.  The OS creates a process entry in its process list[cite: 8].
        2.  Allocates memory for the program[cite: 8].
        3.  Loads the program code and any static data from disk into this memory[cite: 8].
        4.  Sets up the user stack with arguments (e.g., `argc`, `argv` for `main()`)[cite: 8].
        5.  Clears general-purpose registers.
        6.  The OS then effectively "calls" the program's entry point (e.g., `main()`), and the user code begins to execute[cite: 8].
* **Limited Aspect:** The "limited" part comes from ensuring the OS retains control and can restrict the program's actions.
    * **Security (Protection):** The OS must prevent user programs from performing malicious or unintended actions, like accessing another process's memory or directly controlling hardware in an unsafe way[cite: 8].

**Challenges with Pure Direct Execution:**

1.  **Restricted Operations:** What if a user process needs to perform a privileged operation, like disk I/O or allocating more memory? If it runs directly on the CPU, how can this be done safely without giving it full control[cite: 8]?
2.  **Switching Between Processes (Regaining Control):** If a process is running directly on the CPU, the OS is not running. How can the OS stop the current process and switch to another to implement time sharing[cite: 8]?
3.  **Handling Slow Operations:** If process "A" initiates a slow operation like disk I/O, the CPU would sit idle if only direct execution were in play. The OS needs a way to switch to another process ("B") to keep the CPU busy. This is a primary motivation for multiprogramming[cite: 5].

---
## Problem #1: Restricted Operations (Privilege Levels and System Calls)

To allow processes to perform necessary but potentially dangerous operations, hardware provides different **execution modes**[cite: 8]:

* **Kernel Mode (Privileged Mode):**
    * The OS runs in this mode.
    * It has full access to all hardware instructions and system resources[cite: 8].
    * Can perform privileged operations like I/O, memory management, and configuring hardware.
* **User Mode (Restricted Mode):**
    * User programs run in this mode.
    * Hardware restricts what they can do. For example, a user-mode process cannot directly issue an I/O request to a disk or access arbitrary physical memory[cite: 8]. Attempting to do so results in an exception, and the OS typically terminates the offending process.

**Transitioning Between Modes:**

* **Boot Time:** The system boots in **kernel mode**, allowing the OS to initialize itself and the hardware[cite: 8].
* **Running a User Program:**
    * When the OS is ready to run a user program, it uses a special **return-from-trap** instruction. This instruction transitions the CPU to user mode and jumps to the program's entry point[cite: 8].
* **User Program Needs Privileged Operation (System Call):**
    * To perform a restricted operation (e.g., disk I/O, create a new process, allocate memory), the user program must request the OS to do it on its behalf. This is done via a **system call**[cite: 8].
    * **Trap Mechanism:**
        1.  The program executes a special **trap instruction** (e.g., `syscall` on x86-64, `int 0x80` on older x86)[cite: 8].
        2.  This instruction causes the CPU to:
            * **Save state:** The current program counter (PC), flags, and other registers are saved (often onto a per-process kernel stack) so the user program can be resumed later[cite: 8].
            * **Elevate privilege:** Switch from user mode to kernel mode[cite: 8].
            * **Jump to a pre-defined location:** Transfer control to a specific piece of code in the OS known as a **trap handler** (or system call handler)[cite: 8]. The user program cannot specify where in the kernel to jump; the location is determined by the OS setup.
    * **Trap Table (Interrupt Vector Table):**
        * At boot time (in kernel mode), the OS sets up a **trap table** (or interrupt vector table) in memory[cite: 8]. This table contains the addresses of the handlers for various events: system calls, hardware interrupts, exceptions (like division by zero).
        * The OS uses privileged instructions to tell the hardware where this table is located[cite: 8].
        * When a trap occurs, the hardware consults this table to find the correct handler to execute.
    * **System Call Number:** Typically, before executing the trap instruction, the user program (or a library routine acting on its behalf) places a specific **system call number** into a designated register or stack location. The OS uses this number to index into its array of system call handlers to find the correct routine to execute for that specific system call (e.g., `open`, `read`, `write`)[cite: 8].
    * **Kernel Executes Request:** The OS system call handler validates parameters and performs the requested operation.
    * **Return-from-Trap:**
        * Once the OS has finished servicing the request, it executes a special **return-from-trap instruction**[cite: 8].
        * This instruction:
            * **Restores state:** Restores the saved registers (including the PC) of the user process from the kernel stack[cite: 8].
            * **Lowers privilege:** Switches the CPU back to user mode[cite: 8].
            * **Resumes user program:** Jumps back to the instruction in the user program immediately following the trap instruction[cite: 8].

**System Calls in Summary (Table 6.2 from the book is a good reference [cite: 8]):**
A (User Program) `trap` ➡️ OS (Hardware saves user registers, switches to kernel mode, jumps to trap handler) ➡️ OS (Handler executes, performs operation) ➡️ OS `return-from-trap` (Hardware restores user registers, switches to user mode, jumps back to user program) ➡️ A (continues execution)

---
## Problem #2: How to Regain Control (Switching Between Processes)

If a process is running, the OS isn't. How does the OS regain control to switch processes, especially if a process is uncooperative (e.g., in an infinite loop without making system calls)?

* **Cooperative Approach (Legacy):**
    * The OS trusts processes to behave well and give up the CPU periodically[cite: 8].
    * Processes relinquish control by:
        * Making **system calls** (e.g., for I/O)[cite: 8]. The OS can then decide to schedule another process.
        * Explicitly calling a **`yield()` system call**, which just transfers control to the OS[cite: 8].
        * Causing an **illegal operation** (e.g., divide by zero, invalid memory access), which traps to the OS[cite: 8].
    * **Problem:** A malicious or buggy process in an infinite loop that makes no system calls can monopolize the CPU. The only solution in truly cooperative systems might be a reboot[cite: 8].

* **Non-Cooperative Approach (Preemptive Multitasking):**
    * This is the standard in modern OSes and relies on hardware support.
    * **Timer Interrupt:**
        1.  **Hardware Feature:** A hardware **timer device** is programmed by the OS to generate an interrupt at regular intervals (e.g., every few milliseconds)[cite: 8].
        2.  **OS Setup (at boot time, in kernel mode):**
            * The OS installs a **timer interrupt handler** (its address is placed in the trap table)[cite: 8].
            * The OS starts the timer. This is a privileged operation[cite: 8].
        3.  **Interruption:** When the timer interrupt occurs:
            * The currently running process (say "A") is halted, regardless of what it's doing.
            * The CPU hardware saves the state of process A (PC, registers) onto A's kernel stack[cite: 8].
            * The CPU switches to kernel mode.
            * Control is transferred to the OS's pre-configured timer interrupt handler[cite: 8].
        4.  **OS Takes Control:** The OS now has control of the CPU and can decide what to do next, such as:
            * Run its **scheduler** to pick another process to run (say "B").
            * Perform a **context switch** to process B.
            * Resume process A if its time slice isn't over or if it's the highest priority.

**Context Switch:**
When the OS decides to switch from process A to process B:
1.  The OS saves the kernel context of process A (e.g., its general-purpose registers, PC, kernel stack pointer) into A's process control block (PCB)[cite: 8].
2.  The OS restores the kernel context of process B from B's PCB[cite: 8].
3.  By switching kernel stack pointers, the OS effectively transitions from operating in the kernel context of A to the kernel context of B[cite: 8].
4.  The OS then executes a `return-from-trap` instruction.
5.  The hardware restores B's user-level registers (which were saved on B's kernel stack when B was last interrupted) and jumps to B's saved PC in user mode[cite: 8].

**Two types of register saves/restores occur[cite: 8]:**
1.  **User registers to Kernel Stack:** Done by hardware automatically upon a trap or interrupt.
2.  **Kernel registers to Process Structure:** Done by OS software (the `switch()` routine) when explicitly deciding to switch processes. This saves the state of the kernel as it was operating on behalf of the outgoing process.

