/// Pharmacy Inquiries View
///
/// List of customer inquiries and messages.

import SwiftUI

struct PharmacyInquiriesView: View {
    @State private var searchText = ""
    @State private var selectedFilter = 0
    
    // Mock Data
    private let inquiries: [MockInquiry] = [
        MockInquiry(name: "John Doe", message: "Do you have Amoxicillin 500mg in stock?", time: "2m ago", initials: "JD"),
        MockInquiry(name: "Sarah Smith", message: "What are your opening hours on Sunday?", time: "15m ago", initials: "SS"),
        MockInquiry(name: "David N.", message: "I need a prescription refilled.", time: "1h ago", initials: "DN"),
        MockInquiry(name: "Alice M.", message: "Do you deliver to Kacyiru?", time: "2h ago", initials: "AM"),
        MockInquiry(name: "Peter K.", message: "Price for Vitamin C supplements?", time: "3h ago", initials: "PK"),
        MockInquiry(name: "Mary J.", message: "Is the flu vaccine available?", time: "1d ago", initials: "MJ"),
        MockInquiry(name: "Tom H.", message: "Can I pre-order my medication?", time: "1d ago", initials: "TH")
    ]
    
    var body: some View {
        VStack(spacing: 0) {
            // Search Bar
            searchBar
            
            // Filter Tabs
            filterTabs
            
            // List
            List {
                ForEach(inquiries) { inquiry in
                    ZStack {
                        NavigationLink(destination: Text("Chat with \(inquiry.name)")) {
                            EmptyView()
                        }
                        .opacity(0)
                        
                        InquiryRow(inquiry: inquiry)
                    }
                    .listRowSeparator(.hidden)
                    .listRowBackground(Color.clear)
                    .listRowInsets(EdgeInsets(top: 8, leading: 20, bottom: 8, trailing: 20))
                }
            }
            .listStyle(.plain)
            .background(Color.gray.opacity(0.05))
        }
        .navigationTitle("Inquiries")
    }
    
    private var searchBar: some View {
        HStack {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.gray)
            
            TextField("Search inquiries...", text: $searchText)
        }
        .padding(12)
        .background(Color.white)
        .cornerRadius(10)
        .padding(.horizontal)
        .padding(.vertical, 10)
        .background(Color.gray.opacity(0.05))
    }
    
    private var filterTabs: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                FilterChip(title: "All", isSelected: selectedFilter == 0) { selectedFilter = 0 }
                FilterChip(title: "Unread", isSelected: selectedFilter == 1) { selectedFilter = 1 }
                FilterChip(title: "Replied", isSelected: selectedFilter == 2) { selectedFilter = 2 }
                FilterChip(title: "Archived", isSelected: selectedFilter == 3) { selectedFilter = 3 }
            }
            .padding(.horizontal)
            .padding(.bottom, 10)
        }
        .background(Color.gray.opacity(0.05))
    }
}

struct FilterChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .foregroundColor(isSelected ? .white : .textPrimary)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color.primaryTeal : Color.white)
                .cornerRadius(20)
                .shadow(color: Color.black.opacity(0.05), radius: 2, x: 0, y: 1)
        }
    }
}
