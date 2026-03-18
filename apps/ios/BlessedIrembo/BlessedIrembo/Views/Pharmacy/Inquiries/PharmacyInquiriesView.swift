/// Pharmacy Inquiries View
///
/// List of customer inquiries and messages.

import SwiftUI

struct PharmacyInquiriesView: View {
    @ObservedObject var viewModel: PharmacyDashboardViewModel
    @State private var searchText = ""
    @State private var selectedFilter = 0
    
    private var filteredInquiries: [Inquiry] {
        var result = viewModel.inquiries
        if selectedFilter == 1 { // Unread
            result = result.filter { !$0.isRead }
        } else if selectedFilter == 2 { // Read
            result = result.filter { $0.isRead }
        }
        
        if !searchText.isEmpty {
            result = result.filter { $0.userName.localizedCaseInsensitiveContains(searchText) || $0.message.localizedCaseInsensitiveContains(searchText) }
        }
        return result
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Search Bar
            searchBar
            
            // Filter Tabs
            filterTabs
            
            // List
            List {
                ForEach(filteredInquiries) { inquiry in
                    ZStack {
                        NavigationLink(destination: Text("Chat with \(inquiry.userName)")) {
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
