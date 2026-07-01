# Pratvim Mobile Navigation Map

The design prototype screens are mapped to React Native stack routes below. The `spec-panel` is excluded because it is a screen-development panel, not an app route.

## First launch and parent setup

```text
Splash
  └─ Get Started → ParentRegister
ParentRegister
  ├─ Create Parent Account → ParentEmailConfirm
  └─ Already registered? Login → ParentFullLogin
ParentEmailConfirm
  └─ Confirm Email → ParentDetails
ParentDetails
  ├─ Continue to Onboarding → ParentOnboarding
  └─ Register a kid now → KidRegister
ParentOnboarding
  ├─ Next → slide 2
  ├─ Next → slide 3
  ├─ Save & Go Home → ParentDashboard
  └─ Skip → ParentDashboard
```

## Parent area

```text
ParentDashboard
  ├─ Manage / Upgrade plan → PaymentPlans
  ├─ Register kid + → KidRegister
  ├─ Activity dashboard → ParentAnalytics
  ├─ Alerts → ParentAlerts
  ├─ Switch child profile → Login(mode=kid)
  └─ Parent menu → About / Privacy / Terms / Support / PaymentPlans / KidRegister

KidRegister
  └─ Finish and open Parent Home → ParentDashboard

ParentAnalytics
  ├─ Back → ParentDashboard
  ├─ Alerts stat → ParentAlerts
  └─ Register Kid → KidRegister

ParentAlerts
  ├─ Back → ParentDashboard
  └─ Dashboard icon → ParentAnalytics

PaymentPlans
  ├─ Review and Pay → Checkout modal
  └─ Confirm → PaymentConfirmation

PaymentConfirmation
  └─ Return to Parent Home → ParentDashboard
```

## Kid area

```text
Login(mode=kid)
  └─ Start Learning → KidOnboarding
KidOnboarding
  ├─ Next → slide 2
  ├─ Next → slide 3
  ├─ Continue → Home
  └─ Skip → Home
Home
  ├─ Start New Chat → Chat
  ├─ Pinned / Recent cards → Chat(chatId)
  ├─ Kid profile avatar → AvatarLibrary
  └─ Parent profile switch → Login(mode=parent)
Chat
  ├─ History drawer → Chat(chatId) / new chat
  ├─ Timer ring → TimerDemo
  ├─ Plus button → Upload image modal
  ├─ Parent switch → Login(mode=parent)
  └─ Kid profile → AvatarLibrary
TimerDemo
  └─ Back → Chat
AvatarLibrary
  └─ Save child profile → Home
```

## Static/help screens

```text
About
Privacy
Terms
Team
Contact
Support
```
